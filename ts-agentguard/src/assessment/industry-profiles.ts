export type IndustryType =
  | "FINANCIAL"
  | "MANUFACTURING"
  | "HEALTHCARE"
  | "PUBLIC"
  | "TECHNOLOGY";

type AssessmentDomainKey = "aiUsage" | "dataProtection" | "accessControl" | "auditTraceability" | "agentRisk";

export interface IndustryProfile {
  industry: IndustryType;
  label: string;
  weights: Record<AssessmentDomainKey, number>;
  primaryRiskFocus: string;
  coreControlAreas: string[];
  recommendations: string[];
  phases: Array<{ phase: string; title: string }>;
}

export const defaultIndustry: IndustryType = "TECHNOLOGY";

export const industryProfiles: Record<IndustryType, IndustryProfile> = {
  FINANCIAL: {
    industry: "FINANCIAL",
    label: "Financial Services",
    weights: { aiUsage: 15, dataProtection: 20, accessControl: 20, auditTraceability: 15, agentRisk: 30 },
    primaryRiskFocus: "Agent Risk",
    coreControlAreas: ["Agent Risk", "Access Control"],
    recommendations: ["Agent Governance", "Runtime Approval", "Audit Trail"],
    phases: [
      { phase: "Phase 1", title: "AI Usage Policy" },
      { phase: "Phase 2", title: "Governance Design" },
      { phase: "Phase 3", title: "Approval & Audit" },
      { phase: "Phase 4", title: "AgentGuard Runtime Control" },
    ],
  },
  MANUFACTURING: {
    industry: "MANUFACTURING",
    label: "Manufacturing",
    weights: { aiUsage: 15, dataProtection: 15, accessControl: 30, auditTraceability: 15, agentRisk: 25 },
    primaryRiskFocus: "Access Governance",
    coreControlAreas: ["Access Control", "Operational Controls"],
    recommendations: ["Access Governance", "Operational Controls", "Change Management"],
    phases: [
      { phase: "Phase 1", title: "AI Usage Policy" },
      { phase: "Phase 2", title: "Access Governance" },
      { phase: "Phase 3", title: "Operational Controls" },
      { phase: "Phase 4", title: "Change Management" },
    ],
  },
  HEALTHCARE: {
    industry: "HEALTHCARE",
    label: "Healthcare",
    weights: { aiUsage: 10, dataProtection: 35, accessControl: 20, auditTraceability: 20, agentRisk: 15 },
    primaryRiskFocus: "Data Protection",
    coreControlAreas: ["Data Protection", "Audit Controls"],
    recommendations: ["Data Protection", "Data Classification", "Audit Controls"],
    phases: [
      { phase: "Phase 1", title: "Data Protection Policy" },
      { phase: "Phase 2", title: "Data Classification" },
      { phase: "Phase 3", title: "Audit Controls" },
      { phase: "Phase 4", title: "Secure Runtime Control" },
    ],
  },
  PUBLIC: {
    industry: "PUBLIC",
    label: "Public Sector",
    weights: { aiUsage: 10, dataProtection: 20, accessControl: 15, auditTraceability: 35, agentRisk: 20 },
    primaryRiskFocus: "Audit & Traceability",
    coreControlAreas: ["Audit & Traceability", "Approval Governance"],
    recommendations: ["Audit Framework", "Transparency Controls", "Approval Governance"],
    phases: [
      { phase: "Phase 1", title: "AI Usage Policy" },
      { phase: "Phase 2", title: "Transparency Controls" },
      { phase: "Phase 3", title: "Approval Governance" },
      { phase: "Phase 4", title: "Audit Framework" },
    ],
  },
  TECHNOLOGY: {
    industry: "TECHNOLOGY",
    label: "Technology",
    weights: { aiUsage: 20, dataProtection: 20, accessControl: 20, auditTraceability: 20, agentRisk: 20 },
    primaryRiskFocus: "Balanced AI Governance",
    coreControlAreas: ["AI Policy", "Agent Governance"],
    recommendations: ["AI Policy", "Agent Governance", "Secure Development"],
    phases: [
      { phase: "Phase 1", title: "AI Usage Policy" },
      { phase: "Phase 2", title: "Agent Governance" },
      { phase: "Phase 3", title: "Secure Development" },
      { phase: "Phase 4", title: "Runtime Control" },
    ],
  },
};
