import time
from typing import Optional

from agentguard.storage.cache.runtime_cache import InMemoryRuntimeCache, RuntimeCache


class ReplayProtection:
    def __init__(self, cache: Optional[RuntimeCache] = None) -> None:
        self.cache = cache or InMemoryRuntimeCache()

    def register_nonce(self, nonce: str) -> bool:
        key = "nonce:" + nonce
        if self.cache.exists(key):
            return False
        self.cache.set(key, int(time.time()))
        return True

    def nonce_exists(self, nonce: str) -> bool:
        return self.cache.exists("nonce:" + nonce)

    def register_token_usage(self, token_id: str) -> None:
        self.cache.set("token_used:" + token_id, int(time.time()))

    def token_already_used(self, token_id: str) -> bool:
        return self.cache.exists("token_used:" + token_id)
