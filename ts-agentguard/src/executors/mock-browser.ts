import { ActionRequest } from "../models";

function pythonRepr(value: unknown): string {
  if (value === null) {
    return "None";
  }
  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "string") {
    return `'${value}'`;
  }
  if (Array.isArray(value)) {
    return `[${value.map(pythonRepr).join(", ")}]`;
  }
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .map(([key, entry]) => `${pythonRepr(key)}: ${pythonRepr(entry)}`)
      .join(", ")}}`;
  }
  return String(value);
}

export class MockBrowserExecutor {
  preview(actionRequest: ActionRequest): Record<string, unknown> {
    return {
      executor: "mock_browser",
      summary: `Would run ${actionRequest.action_type} on ${actionRequest.target_resource}`,
    };
  }

  execute(actionRequest: ActionRequest, executionToken: string): Record<string, unknown> {
    void executionToken;
    return {
      executor: "mock_browser",
      executed: true,
      message: `Mock executed ${actionRequest.action_type} with parameters ${pythonRepr(actionRequest.parameters)}`,
    };
  }
}
