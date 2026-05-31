import { ActionRequest } from "../models";

export class MockGitHubExecutor {
  preview(actionRequest: ActionRequest): Record<string, unknown> {
    return {
      executor: "mock_github",
      summary: `Would run ${actionRequest.action_type} on ${actionRequest.target_resource}`,
    };
  }

  execute(actionRequest: ActionRequest, executionToken: string): Record<string, unknown> {
    void executionToken;
    return {
      executor: "mock_github",
      executed: true,
      message: `Mock executed ${actionRequest.action_type} on ${actionRequest.target_resource}`,
    };
  }
}
