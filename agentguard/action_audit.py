from datetime import datetime, timezone
from typing import Any


class AuditLog:
    def __init__(self) -> None:
        self.events: list[dict[str, Any]] = []

    def log(self, event_type: str, payload: dict[str, Any]) -> None:
        self.events.append(
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event_type": event_type,
                "payload": payload,
            }
        )

    def list(self) -> list[dict[str, Any]]:
        return self.events
