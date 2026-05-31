export type ApprovalDecision = "approved" | "denied";

export class ApprovalStore {
  private readonly decisions = new Map<string, ApprovalDecision>();

  approve(actionId: string): void {
    this.decisions.set(actionId, "approved");
  }

  deny(actionId: string): void {
    this.decisions.set(actionId, "denied");
  }

  get(actionId: string): ApprovalDecision | undefined {
    return this.decisions.get(actionId);
  }

  clear(): void {
    this.decisions.clear();
  }
}
