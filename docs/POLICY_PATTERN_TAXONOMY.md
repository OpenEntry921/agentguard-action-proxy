# Policy Pattern Taxonomy

## Core Philosophy

**Customer policies are domain-specific.**

**Policy patterns are reusable.**

Financial services, engineering systems, cloud operations, GitHub governance, and device control use different domain language. However, their policy structures often repeat. AgentGuard can enforce reusable policy patterns while customers retain domain-specific policy ownership.

## Initial Taxonomy

### 1. Threshold Policy

Defines a maximum or minimum value for an action.

- **Financial**: LTV must be below 60%.
- **Engineering**: Voltage must be below safety threshold.
- **Cloud**: Instance size must not exceed approved tier.

### 2. Approval Policy

Requires human or system approval before execution.

- **Financial**: Transfers above a defined amount require manager approval.
- **GitHub**: Repository deletion requires administrator approval.
- **Cloud**: Production network changes require change-management approval.

### 3. Asset Boundary Policy

Limits actions to approved assets or resource scopes.

- **Financial**: Agent can only access approved vault.
- **GitHub**: Agent can only modify approved repository.
- **Device**: Agent can only control approved device.

### 4. Role / Permission Policy

Allows actions only for identities with required roles, scopes, or delegated permissions.

- **Financial**: Treasury agent can initiate but not approve settlement.
- **GitHub**: Code agent can create PRs but cannot change branch protection.
- **Cloud**: Automation agent can restart services but cannot create IAM users.

### 5. Time / Location Policy

Restricts actions based on time, geography, network, or environment.

- **Financial**: Settlement actions only during approved operating windows.
- **Engineering**: Device maintenance only during scheduled maintenance windows.
- **Cloud**: Production changes only from approved network zones.

### 6. Segregation of Duties Policy

Prevents the same actor from performing conflicting steps in a workflow.

- **Financial**: Same agent cannot create and approve a payment.
- **GitHub**: Same identity cannot author and approve a protected code change.
- **Operations**: Same automation cannot request and execute emergency override.

### 7. Cumulative Exposure Policy

Limits aggregate exposure across multiple actions over time.

- **Financial**: Daily transfer total must remain below treasury limit.
- **Cloud**: Daily compute spend must remain below budget threshold.
- **Data**: Export volume must remain below approved data movement limit.

### 8. Exception Policy

Defines controlled exceptions to normal policy under explicit conditions.

- **Financial**: Emergency liquidity operation allowed only with incident ticket.
- **Cloud**: Temporary elevated access expires after a fixed window.
- **Device**: Safety override requires dual authorization.

### 9. Manual Review Policy

Routes uncertain or high-impact actions to a human reviewer.

- **Financial**: Unknown wallet destination requires manual review.
- **GitHub**: Security-sensitive repository change requires maintainer review.
- **API**: Unclassified endpoint execution requires security review.

### 10. Allowlist / Denylist Policy

Permits or blocks actions based on explicit lists of actors, targets, actions, or destinations.

- **Financial**: Only allowlisted wallet addresses are valid destinations.
- **GitHub**: Denylisted repositories cannot be modified by agents.
- **Cloud**: Only approved regions can be used for resource creation.
