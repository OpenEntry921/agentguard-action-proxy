# API Context Discovery Engine

## 1. Core Concept

The API Context Discovery Engine is a submodule of Context Engineering.

```text
Context Engineering
└── API Context Discovery Engine
```

API is the living action dictionary of modern enterprise systems.

API는 현대 기업 시스템의 살아있는 행동 사전이다. API를 분석하면 AI Agent가 어떤 행동을 할 수 있는지, 어떤 자산에 접근하는지, 어떤 위험이 있는지 추론할 수 있다.

An API endpoint is not only a URL. It often describes a business action, a target resource, a target system, and a security-relevant intent.

For example:

```http
POST /wallet/withdraw
```

This endpoint can be interpreted as:

```json
{
  "action": "withdraw",
  "resource": "wallet",
  "riskCategory": ["asset_movement", "financial_risk"],
  "sensitivity": "high"
}
```

The API Context Discovery Engine is designed to analyze enterprise API surfaces and automatically or semi-automatically extract the context required for AgentGuard policy design and runtime enforcement.

It helps answer four questions:

1. What actions can an agent perform through enterprise APIs?
2. What resources and target systems are affected by those actions?
3. How risky or sensitive are those actions?
4. Where should AgentGuard be attached to enforce customer policy at execution time?

## 2. Goals

The engine extracts or proposes the following fields from API definitions, logs, gateway exports, or source code route definitions:

- **Action**: The operation being performed, such as `withdraw`, `delete`, `update_firmware`, or `create_issue`.
- **Resource**: The business or technical object affected by the action, such as `wallet`, `repository`, `device`, or `user`.
- **Target System**: The system that owns or executes the API, such as `github`, `exchange`, `device-platform`, or `crm`.
- **Risk Category**: A normalized security or business risk classification.
- **Sensitivity**: A severity-like classification that indicates how carefully the action should be governed.
- **Required Permission**: The likely permission, role, or scope required to call the API.
- **Policy Candidates**: Suggested governance controls that may be reviewed and accepted, modified, or rejected by a human.
- **AgentGuard Application Point**: The point where AgentGuard should observe, approve, constrain, verify, or audit execution.

## 3. Design Principles

1. **API analysis produces policy candidates, not final policy.**
   The engine proposes likely controls, but does not make customer policy decisions by itself. API analysis results are policy candidates, not final policy. Final confirmation is performed by the customer or consultant.

2. **Final policy is owned by the customer.**
   Consultants, security teams, platform owners, or customer administrators confirm the final policy.

3. **AgentGuard does not own customer policy.**
   AgentGuard provides enforcement and evidence for policies selected by the customer.

4. **AgentGuard guarantees runtime adherence.**
   Once policy is defined, AgentGuard ensures the agent's runtime behavior follows that policy.

5. **Human review is part of the control plane.**
   The discovery engine accelerates policy design, but human confirmation is required for high-impact actions.

6. **Execution integrity is a first-class requirement.**
   For sensitive actions, the approved action must match the executed action.

## 4. End-to-End Flow

```text
OpenAPI / Swagger / API Gateway Logs / Source Routes
↓
API Context Discovery Engine
↓
Action Inventory
Resource Inventory
Risk Category
Permission Candidate
Policy Candidate
AgentGuard Attachment Point
↓
Human Review
↓
AgentGuard Policy Adapter
```

### 4.1 Flow Description

| Stage | Responsibility | Example Output |
| --- | --- | --- |
| API Source | Supplies API definitions, gateway exports, logs, or route declarations. | OpenAPI file, Postman collection, API gateway export. |
| API Parser | Converts source-specific formats into normalized endpoint records. | `POST /api/v1/withdraw` |
| Semantic Extractor | Extracts action, resource, operation type, and target system hints. | `action=withdraw`, `resource=wallet` |
| Context Mapper | Maps endpoint semantics into canonical domain fields. | `targetSystem=exchange` |
| Risk Classifier | Assigns risk categories and sensitivity. | `financial_risk`, `CRITICAL` |
| Policy Candidate Generator | Suggests policy patterns and example rules. | `approval_required`, `allowlist_required` |
| Human Review | Confirms, edits, or rejects candidates. | Approved policy draft. |
| AgentGuard Policy Adapter | Converts reviewed candidates into AgentGuard-compatible policy configuration. | Runtime policy bundle. |

## 5. Supported Input Sources

The engine should support multiple source types over time.

### 5.1 MVP Input Source

- OpenAPI / Swagger JSON or YAML files

### 5.2 Planned Input Sources

- Postman Collection
- API Gateway Export
- Kong / Apigee Export
- Nginx / ALB Logs
- CloudTrail
- Source Code Route Definitions

### 5.3 Input Source Interpretation

Different sources provide different confidence levels:

| Source | Strength | Limitation |
| --- | --- | --- |
| OpenAPI / Swagger | Structured method, path, schema, operation ID, tags, and security scopes. | May be incomplete or stale. |
| Postman Collection | Reflects developer-facing workflows and sample requests. | May not represent all production APIs. |
| API Gateway Export | Strong deployment signal. | May lack business semantics. |
| Kong / Apigee Export | Useful for route, plugin, and auth metadata. | May not include request body meaning. |
| Nginx / ALB Logs | Shows actually used endpoints. | Usually lacks schema and permission metadata. |
| CloudTrail | Strong audit and cloud control-plane signal. | Cloud-specific and event-oriented. |
| Source Code Route Definitions | Accurate implementation signal. | Requires language/framework-specific parsers. |

## 6. Canonical Output Model

The canonical output is an `ApiContextRecord`.

```ts
type ApiContextRecord = {
  apiId: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  targetSystem: string;
  action: string;
  resource: string;
  operationType: string;
  riskCategories: string[];
  sensitivity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiredPermissions: string[];
  policyCandidates: PolicyCandidate[];
};

type PolicyCandidate = {
  policyPattern:
    | "approval_required"
    | "threshold_limit"
    | "asset_boundary"
    | "rate_limit"
    | "segregation_of_duties"
    | "manual_review"
    | "allowlist_required"
    | "execution_integrity_required";
  reason: string;
  exampleRule: string;
};
```

### 6.1 Field Semantics

| Field | Meaning | Example |
| --- | --- | --- |
| `apiId` | Stable identifier generated from source, method, path, and operation ID when available. | `openapi:post:/api/v1/withdraw` |
| `method` | HTTP method. | `POST` |
| `path` | Normalized path template. | `/repos/{owner}/{repo}` |
| `targetSystem` | System or service that owns the operation. | `github` |
| `action` | Normalized verb or business action. | `delete` |
| `resource` | Normalized object affected by the action. | `repository` |
| `operationType` | Higher-level operation class. | `destructive_action` |
| `riskCategories` | One or more risk labels. | `source_code_risk` |
| `sensitivity` | Governance importance. | `CRITICAL` |
| `requiredPermissions` | Likely permission scopes or roles. | `repo.admin` |
| `policyCandidates` | Candidate controls for human review. | `manual_review` |

## 7. Semantic Extraction Strategy

### 7.1 Method-Based Signals

HTTP methods provide initial intent signals.

| Method | Typical Meaning | Baseline Risk Signal |
| --- | --- | --- |
| `GET` | Read or list. | Low to medium, depending on data sensitivity. |
| `POST` | Create, execute, trigger, submit, or command. | Medium to critical. |
| `PUT` | Replace or update. | Medium to high. |
| `PATCH` | Partial update. | Medium to high. |
| `DELETE` | Delete or destroy. | High to critical. |

### 7.2 Path-Based Signals

The path provides action and resource clues.

Examples:

| Path Pattern | Extracted Action | Extracted Resource |
| --- | --- | --- |
| `/wallet/withdraw` | `withdraw` | `wallet` |
| `/repos/{owner}/{repo}` with `DELETE` | `delete` | `repository` |
| `/devices/{deviceId}/firmware/update` | `update_firmware` | `device` |
| `/users/{id}/roles` with `PATCH` | `update_role` | `user` |
| `/payments/refund` | `refund` | `payment` |

### 7.3 OpenAPI Metadata Signals

When present, the engine should prefer explicit OpenAPI metadata over path heuristics:

- `operationId`
- `summary`
- `description`
- `tags`
- `security`
- request body schema names
- response schema names
- custom extensions such as `x-service`, `x-permissions`, `x-risk`, or `x-agentguard`

### 7.4 Confidence Scoring

Each extracted field should eventually include a confidence score, even if the MVP output only includes the canonical fields.

Example internal confidence model:

```json
{
  "action": { "value": "withdraw", "confidence": 0.95, "source": "path" },
  "resource": { "value": "wallet", "confidence": 0.8, "source": "path" },
  "targetSystem": { "value": "exchange", "confidence": 0.7, "source": "tag" }
}
```

## 8. Risk Classification

Risk classification maps semantic context to normalized risk categories and sensitivity.

### 8.1 Baseline Risk Categories

| Risk Category | Description | Example Endpoint |
| --- | --- | --- |
| `financial_risk` | Can move, refund, charge, trade, settle, or affect financial value. | `POST /wallet/withdraw` |
| `asset_movement` | Moves digital or physical assets out of a boundary. | `POST /transfers` |
| `destructive_action` | Deletes, destroys, revokes, wipes, or irreversibly modifies a resource. | `DELETE /repos/{owner}/{repo}` |
| `source_code_risk` | Affects source code, repositories, CI/CD, secrets, or deployment pipelines. | `DELETE /repos/{owner}/{repo}` |
| `device_risk` | Controls, configures, updates, or disables devices. | `POST /devices/{id}/firmware/update` |
| `operational_risk` | Can affect production operations or service availability. | `POST /deployments` |
| `identity_risk` | Changes users, roles, groups, credentials, tokens, or permissions. | `PATCH /users/{id}/roles` |
| `data_exfiltration_risk` | Reads or exports sensitive data. | `GET /customers/export` |
| `compliance_risk` | Affects regulated records, audit logs, retention, or compliance controls. | `DELETE /audit-logs/{id}` |
| `configuration_risk` | Changes security, network, infrastructure, or system configuration. | `PATCH /firewall/rules/{id}` |

### 8.2 Sensitivity Levels

| Sensitivity | Meaning | Typical Examples |
| --- | --- | --- |
| `LOW` | Low-impact, usually read-only or low-sensitivity metadata. | List public statuses. |
| `MEDIUM` | Business-relevant action with limited blast radius. | Create a support ticket. |
| `HIGH` | Action can affect operations, devices, identity, or sensitive data. | Update firmware, change user role. |
| `CRITICAL` | Action can move assets, delete critical resources, or bypass controls. | Withdraw funds, delete repository, rotate root credential. |

### 8.3 Example Rule-Based Classification

| Signal | Risk Category | Sensitivity |
| --- | --- | --- |
| method is `DELETE` | `destructive_action` | `HIGH` or `CRITICAL` |
| path contains `withdraw`, `transfer`, `payout` | `financial_risk`, `asset_movement` | `CRITICAL` |
| path contains `firmware`, `device`, `command` | `device_risk`, `operational_risk` | `HIGH` |
| path contains `role`, `permission`, `token`, `credential` | `identity_risk` | `HIGH` or `CRITICAL` |
| path contains `export`, `download`, `dump` | `data_exfiltration_risk` | `HIGH` |
| path contains `deploy`, `release`, `rollback` | `operational_risk` | `HIGH` |

## 9. Policy Candidate Generation

Policy candidates are recommended controls generated from risk categories, sensitivity, action, resource, and operation type.

### 9.1 Policy Pattern Catalog

| Policy Pattern | Purpose | Typical Trigger |
| --- | --- | --- |
| `approval_required` | Requires explicit approval before execution. | High-risk or critical action. |
| `threshold_limit` | Applies numeric constraints. | Amount, count, quota, or spending action. |
| `asset_boundary` | Restricts action to approved target assets. | Device, account, repository, environment. |
| `rate_limit` | Limits repeated execution. | Bulk operation, repeated command, suspicious loop. |
| `segregation_of_duties` | Prevents requester and approver from being the same actor. | Admin, financial, destructive, or compliance action. |
| `manual_review` | Requires human judgment before proceeding. | Irreversible or ambiguous high-impact action. |
| `allowlist_required` | Requires target values to be pre-approved. | Destination address, domain, account, integration. |
| `execution_integrity_required` | Ensures approved intent matches executed request. | Any approved action with mutable parameters. |

### 9.2 Candidate Generation Examples

| Condition | Candidate Policies |
| --- | --- |
| `financial_risk` and `asset_movement` | `approval_required`, `threshold_limit`, `allowlist_required`, `execution_integrity_required` |
| `destructive_action` | `manual_review`, `approval_required`, `segregation_of_duties`, `execution_integrity_required` |
| `device_risk` | `approval_required`, `asset_boundary`, `execution_integrity_required` |
| `identity_risk` | `approval_required`, `segregation_of_duties`, `execution_integrity_required` |
| `data_exfiltration_risk` | `manual_review`, `rate_limit`, `asset_boundary` |
| `operational_risk` | `approval_required`, `asset_boundary`, `rate_limit`, `execution_integrity_required` |

## 10. AgentGuard Integration

The discovery output flows into AgentGuard through policy review and adaptation.

```text
ApiContextRecord
↓
Policy Review
↓
Policy Adapter
↓
AgentGuard Runtime
↓
Execution Integrity Check
↓
Audit Evidence
```

### 10.1 Integration Responsibilities

| Component | Responsibility |
| --- | --- |
| API Context Discovery Engine | Produces endpoint context and policy candidates. |
| Policy Review | Human confirms customer-owned policy decisions. |
| Policy Adapter | Converts reviewed policies into AgentGuard runtime policy format. |
| AgentGuard Runtime | Enforces approval, boundary, threshold, rate, and integrity controls. |
| Execution Integrity Check | Verifies approved request fingerprints match executed requests. |
| Audit Evidence | Records decision, approval, execution, and verification evidence. |

### 10.2 AgentGuard Application Points

The engine should identify where AgentGuard should be attached:

1. **Before tool invocation**: Validate agent intent before a tool call is made.
2. **Before API execution**: Enforce approval, boundary, threshold, and permission checks.
3. **During execution**: Bind approved request parameters to actual execution parameters.
4. **After execution**: Capture evidence, response metadata, and policy decision trace.
5. **During audit review**: Provide searchable records linking API context, policy decision, and runtime execution.

## 11. Example 1: Wallet Withdrawal

### Input

```http
POST /api/v1/withdraw
```

### Output

```json
{
  "method": "POST",
  "path": "/api/v1/withdraw",
  "targetSystem": "exchange",
  "action": "withdraw",
  "resource": "wallet",
  "operationType": "asset_movement",
  "riskCategories": ["financial_risk", "asset_movement"],
  "sensitivity": "CRITICAL",
  "requiredPermissions": ["wallet.withdraw"],
  "policyCandidates": [
    {
      "policyPattern": "approval_required",
      "reason": "Withdrawal moves assets out of the platform.",
      "exampleRule": "withdrawalAmount > threshold requires approval"
    },
    {
      "policyPattern": "allowlist_required",
      "reason": "Destination address should be verified before execution.",
      "exampleRule": "destinationAddress must be in allowlist"
    },
    {
      "policyPattern": "execution_integrity_required",
      "reason": "Approved withdrawal request must match executed withdrawal request.",
      "exampleRule": "approvedAction.fingerprint == executionAction.fingerprint"
    }
  ]
}
```

## 12. Example 2: Repository Deletion

### Input

```http
DELETE /repos/{owner}/{repo}
```

### Output

```json
{
  "method": "DELETE",
  "path": "/repos/{owner}/{repo}",
  "targetSystem": "github",
  "action": "delete",
  "resource": "repository",
  "operationType": "destructive_action",
  "riskCategories": ["destructive_action", "source_code_risk"],
  "sensitivity": "CRITICAL",
  "requiredPermissions": ["repo.admin"],
  "policyCandidates": [
    {
      "policyPattern": "manual_review",
      "reason": "Repository deletion is destructive and irreversible.",
      "exampleRule": "repository.delete requires human approval"
    },
    {
      "policyPattern": "segregation_of_duties",
      "reason": "Requester and approver should not be the same actor.",
      "exampleRule": "requesterId != approverId"
    }
  ]
}
```

## 13. Example 3: Device Firmware Update

### Input

```http
POST /devices/{deviceId}/firmware/update
```

### Output

```json
{
  "method": "POST",
  "path": "/devices/{deviceId}/firmware/update",
  "targetSystem": "device-platform",
  "action": "update_firmware",
  "resource": "device",
  "operationType": "device_control",
  "riskCategories": ["device_risk", "operational_risk"],
  "sensitivity": "HIGH",
  "requiredPermissions": ["device.firmware.update"],
  "policyCandidates": [
    {
      "policyPattern": "approval_required",
      "reason": "Firmware update changes device behavior.",
      "exampleRule": "firmware.update requires approved change ticket"
    },
    {
      "policyPattern": "asset_boundary",
      "reason": "Agent must only update approved devices.",
      "exampleRule": "deviceId must be within approved target set"
    }
  ]
}
```

## 14. MVP Scope

The first implementation should be intentionally narrow and explainable.

### 14.1 MVP Capabilities

- OpenAPI JSON/YAML file input
- HTTP method and path-based action/resource extraction
- Basic target system inference from tags, server URL, title, or file metadata
- Basic risk category mapping
- Sensitivity classification
- Policy candidate generation
- JSON report output
- Markdown report output

### 14.2 MVP Non-Goals

- Fully autonomous policy approval
- Customer-specific policy ownership
- Exhaustive semantic understanding of every endpoint
- Runtime enforcement implementation inside the discovery engine
- Replacement for consultant or customer security review

### 14.3 MVP Processing Steps

1. Load OpenAPI JSON/YAML.
2. Enumerate all paths and supported HTTP methods.
3. Normalize path templates.
4. Extract action and resource from method, path, `operationId`, tags, and summary.
5. Infer target system from OpenAPI metadata.
6. Classify operation type, risk categories, and sensitivity.
7. Generate policy candidates.
8. Emit `ApiContextRecord[]` as JSON.
9. Emit human-readable Markdown review report.

## 15. Future Extensions

- LLM-based API semantic analysis
- Source Code Route Parser
- API Gateway Log-based actual usage pattern analysis
- Shadow API Discovery
- Agent Exposure Score
- API-to-Ontology Mapper
- API Knowledge Graph
- Confidence scoring in the public output model
- Customer-specific risk taxonomy mapping
- Policy simulation before enforcement
- Integration with approval workflow systems
- Drift detection between discovered APIs and enforced policies

## 16. Completion Criteria

This design is complete when it can answer the following questions:

### 16.1 Can we understand what actions an agent can perform by looking at enterprise APIs?

Yes. The engine parses API sources, extracts method/path semantics, uses OpenAPI metadata, and maps endpoints into action/resource/target-system records.

### 16.2 Can we automatically estimate the risk of those actions?

Yes, as a candidate classification. The engine maps methods, path terms, resources, and operation types to risk categories and sensitivity levels. These are explainable estimates that require human review for final policy decisions.

### 16.3 Can we automatically generate policy candidates?

Yes. The engine maps risk categories and sensitivity levels to reusable policy patterns such as `approval_required`, `allowlist_required`, `asset_boundary`, `segregation_of_duties`, and `execution_integrity_required`.

### 16.4 Can we identify where AgentGuard should be attached?

Yes. The engine identifies API operations where AgentGuard should enforce policy before API execution, verify execution integrity during execution, and record audit evidence after execution.

## 17. Summary

The API Context Discovery Engine converts enterprise API structure into actionable AgentGuard governance context. It does not decide customer policy. Instead, it discovers likely agent capabilities, estimates risk, proposes policy candidates, and prepares reviewed controls for AgentGuard runtime enforcement.
