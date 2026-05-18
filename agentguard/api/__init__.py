import importlib.util
from pathlib import Path

_legacy_path = Path(__file__).resolve().parents[1] / 'api.py'
_spec = importlib.util.spec_from_file_location('agentguard._legacy_api', str(_legacy_path))
_module = importlib.util.module_from_spec(_spec)
assert _spec is not None and _spec.loader is not None
_spec.loader.exec_module(_module)

create_app = _module.create_app
create_default_gateway = _module.create_default_gateway
create_runtime_gateway = _module.create_runtime_gateway
_build_payment_tx = _module._build_payment_tx
app = _module.app
