import { randomUUID } from "node:crypto";

import { ActionRequest, EphemeralExecutionToken } from "./models";

export class TokenService {
  private readonly tokens = new Map<string, EphemeralExecutionToken>();

  issue(action: ActionRequest, ttlSeconds = 120): EphemeralExecutionToken {
    const token: EphemeralExecutionToken = {
      token_id: randomUUID(),
      action_id: action.action_id,
      allowed_action_type: action.action_type,
      allowed_target: action.target_resource,
      expires_at: new Date(Date.now() + ttlSeconds * 1000),
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
    token.used = true;
    return [true, "token_valid"];
  }

  clear(): void {
    this.tokens.clear();
  }
}
