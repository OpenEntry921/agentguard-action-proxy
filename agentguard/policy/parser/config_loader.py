import logging
import os
from copy import deepcopy
from pathlib import Path
from typing import Any, Dict, Optional

from agentguard.policy.defaults import default_policy_sections

try:
    import yaml
except ModuleNotFoundError:  # pragma: no cover
    yaml = None


def _fallback_yaml_parse(text: str) -> Dict[str, Any]:
    parsed = {}
    for line in text.splitlines():
        if not line.strip() or line.lstrip().startswith('#'):
            continue
    return parsed


def _load_yaml_file(path: Path) -> Dict[str, Any]:
    raw = path.read_text(encoding='utf-8')
    if yaml is not None:
        loaded = yaml.safe_load(raw)
        return loaded or {}
    return _fallback_yaml_parse(raw)


def merge_policy_files(base_policy: Dict[str, Any], extra_policy: Dict[str, Any]) -> Dict[str, Any]:
    merged = deepcopy(base_policy)
    for key, value in extra_policy.items():
        if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
            merged[key] = merge_policy_files(merged[key], value)
        else:
            merged[key] = deepcopy(value)
    return merged


logger = logging.getLogger(__name__)


def _ensure_policy_defaults(policy: Dict[str, Any]) -> Dict[str, Any]:
    for key, default_value in default_policy_sections().items():
        existing = policy.get(key)
        if isinstance(existing, dict):
            merged = deepcopy(default_value)
            merged.update(existing)
            policy[key] = merged
        elif existing is None:
            policy[key] = deepcopy(default_value)
    return policy


def _apply_deprecated_trustline_whitelist(policy: Dict[str, Any]) -> Dict[str, Any]:
    deprecated_cfg = policy.get("trustline_whitelist")
    if not isinstance(deprecated_cfg, dict):
        return policy
    logger.warning("trustline_whitelist is deprecated. Use trustline_policy + legacy_whitelist instead.")
    legacy = policy.get("legacy_whitelist")
    if not isinstance(legacy, dict):
        legacy = {}
    legacy_allowed = legacy.get("allowed_destinations", [])
    deprecated_allowed = deprecated_cfg.get("allowed_destinations", [])
    if not isinstance(legacy_allowed, list):
        legacy_allowed = []
    if not isinstance(deprecated_allowed, list):
        deprecated_allowed = []
    merged_allowed = list(dict.fromkeys(legacy_allowed + deprecated_allowed))
    legacy["allowed_destinations"] = merged_allowed
    legacy.setdefault("enabled", True)
    policy["legacy_whitelist"] = legacy
    return policy


def load_policy_config(policy_path: Optional[str] = None) -> Dict[str, Any]:
    env_path = os.getenv('AGENTGUARD_POLICY_PATH')
    base_candidates = []
    if policy_path:
        base_candidates.append(Path(policy_path))
    if env_path:
        base_candidates.append(Path(env_path))
    base_candidates.append(Path('configs/policy.yaml'))

    base_path = None
    seen = set()
    for candidate in base_candidates:
        key = str(candidate)
        if key in seen:
            continue
        seen.add(key)
        if candidate.exists():
            base_path = candidate
            break

    if base_path is None:
        raise FileNotFoundError('정책 파일을 찾을 수 없습니다. AGENTGUARD_POLICY_PATH 또는 configs/policy.yaml 경로를 확인하세요.')

    policy = _load_yaml_file(base_path)
    root_dir = base_path.parent
    extras = [
        'risk_rules.yaml',
        'trustline_policy.yaml',
        'destination_policy.yaml',
        'history_policy.yaml',
    ]
    for name in extras:
        extra_path = root_dir / name
        if extra_path.exists():
            policy = merge_policy_files(policy, _load_yaml_file(extra_path))

    policy = _apply_deprecated_trustline_whitelist(policy)
    policy = _ensure_policy_defaults(policy)
    return policy
