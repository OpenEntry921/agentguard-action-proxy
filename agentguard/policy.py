from dataclasses import dataclass
from typing import Optional, Set, Tuple, Any

from agentguard.action_policy import evaluate_policy
from agentguard.policy_engine import PolicyEngine as RuntimePolicyEngine


@dataclass
class Policy:
    max_amount: float
    allowed_merchants: Set[str]
    allowed_purposes: Set[str]
    allowed_actions: Set[str]
    allowed_destinations: Optional[Set[str]] = None
    daily_limit: Optional[float] = None


PolicyEngine = RuntimePolicyEngine


def normalize_amount_for_policy(amount: Any, currency: str) -> Tuple[float, float]:
    raw_amount = float(amount)
    if str(currency).upper() == "XRP":
        normalized = raw_amount * 1_000_000
    else:
        normalized = raw_amount
    return normalized, raw_amount


__all__ = ["Policy", "PolicyEngine", "normalize_amount_for_policy", "evaluate_policy"]


from copy import deepcopy
import logging, os
from pathlib import Path

try:
    import yaml
except ModuleNotFoundError:
    yaml=None

logger=logging.getLogger(__name__)

DEFAULT_TRUSTLINE_POLICY={"mode":"xrpl_lookup","require_trustline":False,"block_if_no_trustline":False,"allowed_currencies":["XRP"],"allowed_issuers":[],"require_authorized_trustline":False,"allow_xrp_without_trustline":True}
DEFAULT_DESTINATION_POLICY={"require_account_exists":True,"allow_new_destination":True,"new_destination_risk_score":20,"block_if_account_not_found":True}
DEFAULT_HISTORY_POLICY={"enable_account_tx_lookup":False,"detect_new_destination":True}

def default_policy_sections():
    return {"trustline_policy":deepcopy(DEFAULT_TRUSTLINE_POLICY),"destination_policy":deepcopy(DEFAULT_DESTINATION_POLICY),"history_policy":deepcopy(DEFAULT_HISTORY_POLICY)}

def merge_policy_files(base_policy,extra_policy):
    merged=deepcopy(base_policy)
    for key,value in extra_policy.items():
        if key in merged and isinstance(merged[key],dict) and isinstance(value,dict):
            merged[key]=merge_policy_files(merged[key],value)
        else:
            merged[key]=deepcopy(value)
    return merged

def _load_yaml_file(path:Path):
    raw=path.read_text(encoding="utf-8")
    if yaml is not None:
        return yaml.safe_load(raw) or {}
    return {}

def _ensure_policy_defaults(policy):
    for key,default_value in default_policy_sections().items():
        existing=policy.get(key)
        if isinstance(existing,dict):
            merged=deepcopy(default_value); merged.update(existing); policy[key]=merged
        elif existing is None:
            policy[key]=deepcopy(default_value)
    return policy

def _apply_deprecated_trustline_whitelist(policy):
    deprecated_cfg=policy.get("trustline_whitelist")
    if not isinstance(deprecated_cfg,dict):
        return policy
    legacy=policy.get("legacy_whitelist") if isinstance(policy.get("legacy_whitelist"),dict) else {}
    merged=list(dict.fromkeys((legacy.get("allowed_destinations",[]) if isinstance(legacy.get("allowed_destinations",[]),list) else []) + (deprecated_cfg.get("allowed_destinations",[]) if isinstance(deprecated_cfg.get("allowed_destinations",[]),list) else [])))
    legacy["allowed_destinations"]=merged; legacy.setdefault("enabled",True); policy["legacy_whitelist"]=legacy
    return policy

def load_policy_config(policy_path=None):
    env_path=os.getenv("AGENTGUARD_POLICY_PATH")
    candidates=[Path(policy_path)] if policy_path else []
    if env_path: candidates.append(Path(env_path))
    candidates.append(Path("configs/policy.yaml"))
    base=next((c for c in candidates if c.exists()),None)
    if base is None: raise FileNotFoundError("policy not found")
    policy=_load_yaml_file(base)
    for name in ["risk_rules.yaml","trustline_policy.yaml","destination_policy.yaml","history_policy.yaml"]:
        extra=base.parent/name
        if extra.exists(): policy=merge_policy_files(policy,_load_yaml_file(extra))
    return _ensure_policy_defaults(_apply_deprecated_trustline_whitelist(policy))

def compute_policy_hash(policy_payload):
    import copy as _c
    return __import__("hashlib").sha256(__import__("json").dumps(_c.deepcopy(policy_payload),sort_keys=True,separators=(",",":"),ensure_ascii=False).encode("utf-8")).hexdigest()
