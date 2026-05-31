import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import { z, ZodTypeAny } from "zod";

import { ApprovalStore } from "./approval";
import { AuditLog } from "./audit";
import { MockBrowserExecutor } from "./executors/mock-browser";
import { MockGitHubExecutor } from "./executors/mock-github";
import { ActionRequest, ActionRequestSchema, Decision, ExecuteRequestSchema, PreviewResponse } from "./models";
import { evaluatePolicy } from "./policy";
import { scoreRisk } from "./risk";
import { TokenService } from "./token-service";

interface ActionIdParams {
  actionId: string;
}

export interface AgentGuardState {
  audit: AuditLog;
  approvals: ApprovalStore;
  tokens: TokenService;
  previews: Map<string, PreviewResponse>;
  attemptCounter: Map<string, number>;
}

function validateBody<TSchema extends ZodTypeAny>(
  schema: TSchema,
  body: unknown,
  reply: FastifyReply,
): z.output<TSchema> | undefined {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    reply.code(422).send({ detail: parsed.error.issues });
    return undefined;
  }
  return parsed.data;
}

function demoHtml(): string {
  const candidates = [
    join(process.cwd(), "ts-agentguard", "src", "demo", "demo.html"),
    join(process.cwd(), "src", "demo", "demo.html"),
    join(__dirname, "demo", "demo.html"),
  ];
  const demoPath = candidates.find((candidate) => existsSync(candidate));
  if (!demoPath) {
    throw new Error("demo_html_not_found");
  }
  return readFileSync(demoPath, "utf-8");
}

export function buildServer(state: AgentGuardState = createState()): FastifyInstance {
  const app = Fastify({ logger: false });
  const { audit, approvals, tokens, previews, attemptCounter } = state;

  app.get("/health", async () => ({ status: "ok" }));

  app.post("/actions/preview", async (request, reply) => {
    const action = validateBody(ActionRequestSchema, request.body, reply);
    if (!action) {
      return reply;
    }

    audit.log("action_requested", { action_id: action.action_id, action_type: action.action_type });
    const key = `${action.actor_id}:${action.action_type}:${action.target_resource}`;
    const attempts = attemptCounter.get(key) ?? 0;

    const { decision, matchedPolicies, reason } = evaluatePolicy(action);
    audit.log("policy_evaluated", {
      action_id: action.action_id,
      matched_policies: matchedPolicies,
      decision,
    });

    const risk = scoreRisk(action, attempts);
    audit.log("risk_scored", {
      action_id: action.action_id,
      risk_score: risk.score,
      risk_level: risk.level,
      risk_factors: risk.factors,
    });

    const approvalRequired = decision === Decision.REVIEW_REQUIRED;
    if (approvalRequired) {
      audit.log("approval_requested", { action_id: action.action_id });
    }

    const interpreted = `${action.actor_type}:${action.actor_id} requests ${action.action_type} on ${action.target_system}/${action.target_resource}`;
    const preview: PreviewResponse = {
      action_id: action.action_id,
      interpreted_action_meaning: interpreted,
      risk_score: risk.score,
      risk_level: risk.level,
      matched_policies: matchedPolicies,
      decision,
      reason,
      approval_required: approvalRequired,
      risk_factors: risk.factors,
    };

    previews.set(action.action_id, preview);
    attemptCounter.set(key, attempts + 1);
    audit.log("preview_generated", preview);
    return preview;
  });

  app.post<{ Params: ActionIdParams }>("/actions/:actionId/approve", async (request) => {
    const { actionId } = request.params;
    approvals.approve(actionId);
    audit.log("approved", { action_id: actionId });
    return { action_id: actionId, status: "approved" };
  });

  app.post<{ Params: ActionIdParams }>("/actions/:actionId/deny", async (request) => {
    const { actionId } = request.params;
    approvals.deny(actionId);
    audit.log("denied", { action_id: actionId });
    return { action_id: actionId, status: "denied" };
  });

  app.post("/actions/execute", async (request, reply) => {
    const req = validateBody(ExecuteRequestSchema, request.body, reply);
    if (!req) {
      return reply;
    }

    const action = req.action_request;
    const preview = previews.get(action.action_id);
    if (!preview) {
      return reply.code(400).send({ detail: "preview_required_before_execute" });
    }

    const approval = approvals.get(action.action_id);

    if (preview.decision === Decision.DENY) {
      audit.log("execution_blocked", { action_id: action.action_id, reason: "policy_denied" });
      return {
        action_id: action.action_id,
        decision: "DENY",
        executed: false,
        message: "Execution denied by policy.",
      };
    }

    if (preview.decision === Decision.REVIEW_REQUIRED && approval !== "approved") {
      audit.log("execution_blocked", { action_id: action.action_id, reason: "approval_not_granted" });
      return {
        action_id: action.action_id,
        decision: "REVIEW_REQUIRED",
        executed: false,
        message: "Approval required before execution.",
      };
    }

    const [valid, reason] = tokens.validateForExecution(req.execution_token, action);
    if (!valid) {
      audit.log("execution_blocked", { action_id: action.action_id, reason });
      return {
        action_id: action.action_id,
        decision: "BLOCKED",
        executed: false,
        message: reason,
      };
    }

    const executor = action.target_system === "github" ? new MockGitHubExecutor() : new MockBrowserExecutor();
    audit.log("execution_attempted", { action_id: action.action_id, executor: executor.constructor.name });
    const result = executor.execute(action, req.execution_token);
    const final = { action_id: action.action_id, decision: "ALLOW", ...result };
    audit.log("execution_completed", final);
    return final;
  });

  app.get("/audit", async () => audit.list());

  app.post("/demo/reset", async () => {
    audit.clear();
    approvals.clear();
    tokens.clear();
    previews.clear();
    attemptCounter.clear();
    return {
      status: "reset",
      message: "새 데모 세션 초기화됨",
      cleared: [
        "audit_timeline",
        "approval_workflow_state",
        "pending_actions",
        "execution_result",
        "issued_execution_tokens",
        "current_scenario_state",
      ],
    };
  });

  app.get("/demo", async (_request, reply) => reply.type("text/html; charset=utf-8").send(demoHtml()));

  app.post<{ Params: ActionIdParams }>("/actions/:actionId/token", async (request, reply) => {
    const action = validateBody(ActionRequestSchema, request.body, reply);
    if (!action) {
      return reply;
    }

    const { actionId } = request.params;
    if (actionId !== action.action_id) {
      return reply.code(400).send({ detail: "action_id_mismatch" });
    }

    const token = tokens.issue(action);
    audit.log("token_issued", {
      action_id: action.action_id,
      token_id: token.token_id,
      expires_at: token.expires_at.toISOString(),
    });
    return { token_id: token.token_id };
  });

  return app;
}

export function createState(): AgentGuardState {
  return {
    audit: new AuditLog(),
    approvals: new ApprovalStore(),
    tokens: new TokenService(),
    previews: new Map<string, PreviewResponse>(),
    attemptCounter: new Map<string, number>(),
  };
}

export const app = buildServer();

if (require.main === module) {
  const port = Number(process.env.PORT ?? 8000);
  const host = process.env.HOST ?? "0.0.0.0";
  app.listen({ port, host }).catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
}

export type { ActionRequest };
