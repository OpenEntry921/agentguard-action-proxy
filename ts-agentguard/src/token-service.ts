import { createHash, randomUUID } from "node:crypto";

import { ActionRequest, EphemeralExecutionToken } from "./models";

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function actionFingerprint(action: ActionRequest): string {
  return createHash("sha256")
    .update(stableStringify({
      action_id: action.action_id,
      actor_id: action.actor_id,
      action_type: action.action_type,
      target_system: action.target_system,
      target_resource: action.target_resource,
      parameters: action.parameters,
      context: action.context,
    }))
    .digest("hex");
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return undefined;
}


export class TokenService {
  private readonly tokens = new Map<string, EphemeralExecutionToken>();

  issue(action: ActionRequest, ttlSeconds = 120): EphemeralExecutionToken {
    const token: EphemeralExecutionToken = {
      token_id: randomUUID(),
      action_id: action.action_id,
      allowed_action_type: action.action_type,
      allowed_target: action.target_resource,
      expires_at: new Date(Date.now() + ttlSeconds * 1000),
      request_fingerprint: actionFingerprint(action),
      approved_loan_amount: numberValue(action.parameters.loanAmountRLUSD),
      used: false,
    };
    this.tokens.set(token.token_id, token);
    return token;
  }

  validateForExecution(tokenId: string, action: ActionRequest): [boolean, string] {
    const token = this.tokens.get(tokenId);
    if (!token) {
      return [false, "token_not_found"];
    }
    if (token.expires_at.getTime() < Date.now()) {
      return [false, "token_expired"];
    }
    if (token.used) {
      return [false, "token_already_used"];
    }
    if (token.action_id !== action.action_id) {
      return [false, "action_id_mismatch"];
    }
    if (token.allowed_action_type !== action.action_type) {
      return [false, "action_type_mismatch"];
    }
    if (token.allowed_target !== action.target_resource) {
      return [false, "target_mismatch"];
    }
    if (token.approved_loan_amount !== undefined && token.approved_loan_amount !== numberValue(action.parameters.loanAmountRLUSD)) {
      return [false, "loan_amount_mismatch"];
    }
    if (token.request_fingerprint && token.request_fingerprint !== actionFingerprint(action)) {
      return [false, "request_fingerprint_mismatch"];
    }
    token.used = true;
    return [true, "token_valid"];
  }

  clear(): void {
    this.tokens.clear();
  }
}
