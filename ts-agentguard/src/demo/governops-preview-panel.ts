import type { GovernOpsPreview } from "../governops/preview-adapter";

export const kgldGovernOpsPreviewData = {
  runtimePolicy: {
    policyId: "KGLD-GOVERNOPS-POLICY-001",
    sourceQuestionIds: ["Q031", "Q032", "Q053"],
    actionTaxonomy: "gold.purchase",
    budgetLimit: 5_000_000,
    approvalRequired: true,
    enforcementType: "BLOCK",
    decisionRecordLevel: "FULL",
    identityRequirement: "AGENT_IDENTITY_REQUIRED",
    contextRequirement: "USER_REQUEST_AMOUNT_MATCH_REQUIRED",
  },
  runtimeContext: {
    contextId: "CTX-KGLD-001",
    userRequestAmount: 5_000_000,
    agentDecisionAmount: 50_000_000,
    deviationPercent: 900,
    promptHash: "kgld-demo-user-request-gold-5m",
    ragHash: "kgld-demo-rag-context-v1",
    reputationScore: 80,
    riskScore: 95,
    timestamp: "2026-06-25T00:00:00.000Z",
  },
  decisionRecord: {
    decisionId: "DEC-KGLD-001",
    policyId: "KGLD-GOVERNOPS-POLICY-001",
    sourceQuestionIds: ["Q031", "Q032", "Q053"],
    agentId: "AGT-001",
    contextId: "CTX-KGLD-001",
    userRequestAmount: 5_000_000,
    agentDecisionAmount: 50_000_000,
    riskScore: 95,
    enforcementAction: "BLOCK",
    approvalState: "PENDING",
    tokenStatus: "NOT_ISSUED",
    executionResult: "NOT_EXECUTED",
    auditCorrelationId: "AUD-KGLD-001",
    createdAt: "2026-06-25T00:00:00.000Z",
  },
  harnessResult: {
    enforcementAction: "BLOCK",
    reason: "Agent decision amount deviates 900% from the user-requested gold purchase budget.",
    sourceQuestionIds: ["Q031", "Q032", "Q053"],
    policyId: "KGLD-GOVERNOPS-POLICY-001",
    decisionId: "DEC-KGLD-001",
    approvalState: "PENDING",
    executionAllowed: false,
    tokenStatus: "NOT_ISSUED",
  },
  summary:
    "User requested 5M KRW.\n" +
    "Agent attempted 50M KRW.\n" +
    "GovernOps blocked execution before settlement.\n" +
    "Token was not issued.",
} satisfies GovernOpsPreview;

function formatKrw(amount: number): string {
  return `${amount.toLocaleString("en-US")} KRW`;
}

function renderRow(label: string, value: string): string {
  return `<div class="item"><div class="label">${label}</div><div class="value">${value}</div></div>`;
}

function renderDecisionBadge(decision: string): string {
  const decisionClass = decision === "BLOCK" ? "BLOCKED" : decision;
  return `<span class="decision ${decisionClass}">${decision}</span>`;
}

export function renderGovernOpsPreviewPanelHtml(
  preview: GovernOpsPreview = kgldGovernOpsPreviewData,
): string {
  const { runtimePolicy, runtimeContext, decisionRecord, harnessResult } = preview;

  return [
    '<div class="kv">',
    renderRow("User Request", formatKrw(runtimeContext.userRequestAmount)),
    renderRow("Agent Decision", formatKrw(runtimeContext.agentDecisionAmount)),
    renderRow("Deviation", `${runtimeContext.deviationPercent}%`),
    "</div>",
    '<div class="flow-arrow">↓</div>',
    '<div class="kv">',
    renderRow("AGAF Policy", runtimePolicy.sourceQuestionIds.join(", ")),
    renderRow("Decision Record", decisionRecord.decisionId),
    "</div>",
    '<div class="flow-arrow">↓</div>',
    '<div class="kv">',
    renderRow("Harness Result", renderDecisionBadge(harnessResult.enforcementAction)),
    renderRow("Token Status", harnessResult.tokenStatus),
    renderRow("Execution", decisionRecord.executionResult),
    "</div>",
    '<p class="note">GovernOps detected that the AI Agent attempted to execute an action 10x larger than the original user request.</p>',
    '<p class="note"><b>No Decision Record → No Token → No Execution</b></p>',
  ].join("");
}

export const kgldGovernOpsPreviewHtml = renderGovernOpsPreviewPanelHtml();

export const renderGovernOpsPreview = renderGovernOpsPreviewPanelHtml;
