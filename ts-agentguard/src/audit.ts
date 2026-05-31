export interface AuditEvent {
  timestamp: string;
  event_type: string;
  payload: Record<string, unknown>;
}

export class AuditLog {
  private readonly events: AuditEvent[] = [];

  log(eventType: string, payload: Record<string, unknown>): void {
    this.events.push({
      timestamp: new Date().toISOString(),
      event_type: eventType,
      payload,
    });
  }

  list(): AuditEvent[] {
    return this.events;
  }

  clear(): void {
    this.events.length = 0;
  }
}
