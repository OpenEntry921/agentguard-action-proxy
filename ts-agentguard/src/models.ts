import { z } from "zod";

export const Decision = {
  ALLOW: "ALLOW",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  DENY: "DENY",
} as const;

export const RiskLevel = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export const DecisionSchema = z.nativeEnum(Decision);
export const RiskLevelSchema = z.nativeEnum(RiskLevel);

export type Decision = (typeof Decision)[keyof typeof Decision];
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const ActionRequestSchema = z.object({
  action_id: z.string(),
  actor_type: z.enum(["user", "ai_agent", "system"]),
  actor_id: z.string(),
  action_type: z.string(),
  target_system: z.string(),
  target_resource: z.string(),
  parameters: z.record(z.unknown()).default({}),
  context: z.record(z.unknown()).default({}),
  requested_at: z.coerce.date().default(() => new Date()),
});

export const ExecuteRequestSchema = z.object({
  action_request: ActionRequestSchema,
  execution_token: z.string(),
});

export const ApprovalResponseSchema = z.object({
  action_id: z.string(),
  status: z.enum(["approved", "denied"]),
});

export const PreviewResponseSchema = z.object({
  action_id: z.string(),
  interpreted_action_meaning: z.string(),
  risk_score: z.number().int(),
  risk_level: RiskLevelSchema,
  matched_policies: z.array(z.string()),
  decision: DecisionSchema,
  reason: z.string(),
  approval_required: z.boolean(),
  risk_factors: z.array(z.string()),
});

export const EphemeralExecutionTokenSchema = z.object({
  token_id: z.string(),
  action_id: z.string(),
  allowed_action_type: z.string(),
  allowed_target: z.string(),
  expires_at: z.date(),
  used: z.boolean().default(false),
});

export type ActionRequest = z.infer<typeof ActionRequestSchema>;
export type ExecuteRequest = z.infer<typeof ExecuteRequestSchema>;
export type ApprovalResponse = z.infer<typeof ApprovalResponseSchema>;
export type PreviewResponse = z.infer<typeof PreviewResponseSchema>;
export type EphemeralExecutionToken = z.infer<typeof EphemeralExecutionTokenSchema>;

export interface ExecutionResult {
  action_id: string;
  decision: string;
  executed: boolean;
  message: string;
  executor?: string;
}
