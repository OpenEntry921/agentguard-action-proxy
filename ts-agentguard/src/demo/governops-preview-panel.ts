import type { GovernOpsPreview } from "../governops/preview-adapter";
import { createGovernOpsPreview } from "../governops/preview-adapter";

const preview = createGovernOpsPreview();
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
  governOpsPreview: GovernOpsPreview = preview,
): string {
  const { runtimePolicy, runtimeContext, decisionRecord, harnessResult } = governOpsPreview;

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
