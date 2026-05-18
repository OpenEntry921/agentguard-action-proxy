from typing import Any, Dict, Optional


class RuntimeCache:
    def get(self, key: str, default: Optional[Any] = None) -> Any:
        raise NotImplementedError

    def set(self, key: str, value: Any) -> None:
        raise NotImplementedError

    def delete(self, key: str) -> None:
        raise NotImplementedError

    def exists(self, key: str) -> bool:
        raise NotImplementedError


class InMemoryRuntimeCache(RuntimeCache):
    def __init__(self) -> None:
        self._store = {}  # type: Dict[str, Any]

    def get(self, key: str, default: Optional[Any] = None) -> Any:
        return self._store.get(key, default)

    def set(self, key: str, value: Any) -> None:
        self._store[key] = value

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def exists(self, key: str) -> bool:
        return key in self._store
