class ApprovalStore:
    def __init__(self) -> None:
        self._decisions: dict[str, str] = {}

    def approve(self, action_id: str) -> None:
        self._decisions[action_id] = "approved"

    def deny(self, action_id: str) -> None:
        self._decisions[action_id] = "denied"

    def get(self, action_id: str) -> str | None:
        return self._decisions.get(action_id)
