import importlib.util
from pathlib import Path

_legacy_path = Path(__file__).resolve().parents[1] / 'policy.py'
_spec = importlib.util.spec_from_file_location('agentguard._legacy_policy', str(_legacy_path))
_module = importlib.util.module_from_spec(_spec)
assert _spec is not None and _spec.loader is not None
_spec.loader.exec_module(_module)

Policy = _module.Policy
PolicyEngine = _module.PolicyEngine
normalize_amount_for_policy = _module.normalize_amount_for_policy
