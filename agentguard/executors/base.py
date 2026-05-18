from abc import ABC, abstractmethod

from agentguard.models import ActionRequest


class Executor(ABC):
    @abstractmethod
    def preview(self, action_request: ActionRequest) -> dict:
        ...

    @abstractmethod
    def execute(self, action_request: ActionRequest, execution_token: str) -> dict:
        ...
