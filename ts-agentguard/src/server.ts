import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import { z, ZodTypeAny } from "zod";

import { ApprovalStore } from "./approval";
import { AuditLog } from "./audit";
import { assessmentDashboardHtml, assessmentLandingHtml, assessmentQuestionnaireHtml, executiveAssessmentSummaryHtml } from "./assessment";
import { demoAssessmentAnswers, evaluateAssessment } from "./assessment/scoring";
import { getPolicyAssessmentResult, policyAssessmentDashboardHtml, policyAssessmentReportHtml } from "./assessment/policy-assessment";
import { renderGovernOpsPreviewPanelHtml } from "./demo/governops-preview-panel";
import { MockBrowserExecutor } from "./executors/mock-browser";
import { MockGitHubExecutor } from "./executors/mock-github";
import { SettlementOrchestratorExecutor } from "./executors/settlement-orchestrator";
import { goldAuditFields } from "./gold";
import { kgldAuditFields } from "./kgld";
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

function createExecutor(action: ActionRequest) {
  if (action.target_system === "settlement_orchestrator") {
    return new SettlementOrchestratorExecutor();
  }

  if (action.target_system === "github") {
    return new MockGitHubExecutor();
  }

  return new MockBrowserExecutor();
}

function loadLocalEnvFile(): void {
  const envPath = join(__dirname, "..", ".env");
  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    process.env[key] ??= value.replace(/^(["'])(.*)\1$/, "$2");
  }
}

loadLocalEnvFile();

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

function actionAuditFields(action: ActionRequest): Record<string, unknown> {
  return { ...goldAuditFields(action), ...kgldAuditFields(action) };
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

function kgldDemoHtml(): string {
  const candidates = [
    join(process.cwd(), "ts-agentguard", "src", "demo", "kgld-vault-demo.html"),
    join(process.cwd(), "src", "demo", "kgld-vault-demo.html"),
    join(__dirname, "demo", "kgld-vault-demo.html"),
  ];
  const demoPath = candidates.find((candidate) => existsSync(candidate));
  if (!demoPath) {
    throw new Error("kgld_demo_html_not_found");
  }
  return readFileSync(demoPath, "utf-8");
}

const AssessmentDashboardBodySchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(4)]),
  })),
});

const AssessmentSummaryBodySchema = z.object({
  result: z.custom<ReturnType<typeof evaluateAssessment>>((value) => typeof value === "object" && value !== null),
});

const PolicyAssessmentQuerySchema = z.object({
  source: z.string().optional(),
});

const PolicyAssessmentReportBodySchema = z.object({
  source: z.string(),
});

export function buildServer(state: AgentGuardState = createState()): FastifyInstance {
  const app = Fastify({ logger: false });
  const { audit, approvals, tokens, previews, attemptCounter } = state;

  app.get("/health", async () => ({ status: "ok" }));

  app.post("/actions/preview", async (request, reply) => {
    const action = validateBody(ActionRequestSchema, request.body, reply);
    if (!action) {
      return reply;
    }

    const goldFields = actionAuditFields(action);
    audit.log("action_requested", { action_id: action.action_id, action_type: action.action_type, ...goldFields });
    const key = `${action.actor_id}:${action.action_type}:${action.target_resource}`;
    const attempts = attemptCounter.get(key) ?? 0;

    const { decision, matchedPolicies, reason } = evaluatePolicy(action);
    audit.log("policy_evaluated", {
      action_id: action.action_id,
      matched_policies: matchedPolicies,
      decision,
      ...goldFields,
    });

    const risk = scoreRisk(action, attempts);
    audit.log("risk_scored", {
      action_id: action.action_id,
      risk_score: risk.score,
      risk_level: risk.level,
      risk_factors: risk.factors,
      ...goldFields,
    });

    const approvalRequired = decision === Decision.REVIEW_REQUIRED;
    if (approvalRequired) {
      audit.log("approval_requested", { action_id: action.action_id, ...goldFields });
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
    audit.log("preview_generated", { ...preview, ...goldFields });
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
      audit.log("execution_blocked", { action_id: action.action_id, reason: "policy_denied", ...actionAuditFields(action) });
      return {
        action_id: action.action_id,
        decision: "DENY",
        executed: false,
        message: "Execution denied by policy.",
      };
    }

    if (preview.decision === Decision.REVIEW_REQUIRED && approval !== "approved") {
      audit.log("execution_blocked", { action_id: action.action_id, reason: "approval_not_granted", ...actionAuditFields(action) });
      return {
        action_id: action.action_id,
        decision: "REVIEW_REQUIRED",
        executed: false,
        message: "Approval required before execution.",
      };
    }

    const [valid, reason] = tokens.validateForExecution(req.execution_token, action);
    if (!valid) {
      const isDrift = reason === "request_fingerprint_mismatch" || reason === "loan_amount_mismatch";
      const validationPayload = {
        action_id: action.action_id,
        reason: isDrift ? "request_fingerprint_mismatch" : reason,
        outcome: "blocked",
        ...(isDrift ? {
          threatType: "AI_AGENT_DRIFT",
          approvedField: "loanAmountRLUSD",
          approvedValue: 500,
          executionValue: action.parameters.loanAmountRLUSD,
        } : {}),
        ...actionAuditFields(action),
      };
      audit.log("execution_token_validation_failed", validationPayload);
      if (reason === "target_mismatch") {
        audit.log("target_mismatch", validationPayload);
        audit.log("unauthorized_vault_access", validationPayload);
      }
      audit.log("execution_blocked", validationPayload);
      return {
        action_id: action.action_id,
        decision: "BLOCKED",
        executed: false,
        message: isDrift ? "Execution request does not match approved request." : reason,
        ...(isDrift ? { threatType: "AI_AGENT_DRIFT" } : {}),
      };
    }

    const executor = createExecutor(action);
    audit.log("execution_attempted", {
      action_id: action.action_id,
      executor: executor.constructor.name,
      ...actionAuditFields(action),
    });
    const result = await executor.execute(action, req.execution_token);
    const final = {
      ...result,
      action_id: action.action_id,
      decision: typeof result.decision === "string" ? result.decision : "ALLOW",
    };
    audit.log("execution_completed", { ...final, ...actionAuditFields(action) });
    return final;
  });

  app.get("/audit", async () => audit.list());

  app.post("/demo/audit-event", async (request) => {
    const body = (request.body ?? {}) as Record<string, unknown>;
    const eventType = typeof body.event_type === "string" ? body.event_type : "demo_event";
    const payload = typeof body.payload === "object" && body.payload !== null ? (body.payload as Record<string, unknown>) : {};
    audit.log(eventType, payload);
    return { status: "recorded", event_type: eventType };
  });

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

  app.get("/demo/kgld", async (_request, reply) => reply.type("text/html; charset=utf-8").send(kgldDemoHtml()));

  app.get("/demo/governops-preview-panel", async (_request, reply) =>
    reply.type("text/html; charset=utf-8").send(renderGovernOpsPreviewPanelHtml()),
  );

  app.get("/demo/assessment", async (_request, reply) =>
    reply.type("text/html; charset=utf-8").send(assessmentLandingHtml()),
  );

  app.get("/assessment/start", async (_request, reply) =>
    reply.type("text/html; charset=utf-8").send(assessmentQuestionnaireHtml()),
  );

  app.get("/assessment/policy", async (request, reply) => {
    const query = PolicyAssessmentQuerySchema.parse(request.query);
    const result = getPolicyAssessmentResult(query.source ?? "오픈은행_AI_정책.pdf");
    return reply.type("text/html; charset=utf-8").send(policyAssessmentDashboardHtml(result));
  });

  app.post("/assessment/dashboard", async (request, reply) => {
    const body = validateBody(AssessmentDashboardBodySchema, request.body, reply);
    if (!body) {
      return reply;
    }

    const result = evaluateAssessment(body.answers);
    return reply.type("text/html; charset=utf-8").send(assessmentDashboardHtml(result));
  });

  app.get("/report", async (_request, reply) => {
    const result = evaluateAssessment(demoAssessmentAnswers);
    return reply.type("text/html; charset=utf-8").send(executiveAssessmentSummaryHtml(result));
  });

  app.get("/report/executive-summary", async (_request, reply) => {
    const result = evaluateAssessment(demoAssessmentAnswers);
    return reply.type("text/html; charset=utf-8").send(executiveAssessmentSummaryHtml(result));
  });

  app.post("/summary", async (request, reply) => {
    const body = validateBody(AssessmentSummaryBodySchema, request.body, reply);
    if (!body) {
      return reply;
    }

    return reply.type("text/html; charset=utf-8").send(executiveAssessmentSummaryHtml(body.result));
  });

  app.post("/assessment/report", async (request, reply) => {
    const body = validateBody(AssessmentDashboardBodySchema, request.body, reply);
    if (!body) {
      return reply;
    }

    const result = evaluateAssessment(body.answers);
    return reply.type("text/html; charset=utf-8").send(executiveAssessmentSummaryHtml(result));
  });

  app.post("/assessment/policy/report", async (request, reply) => {
    const body = validateBody(PolicyAssessmentReportBodySchema, request.body, reply);
    if (!body) {
      return reply;
    }

    const result = getPolicyAssessmentResult(body.source);
    return reply.type("text/html; charset=utf-8").send(policyAssessmentReportHtml(result));
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
      ...actionAuditFields(action),
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
