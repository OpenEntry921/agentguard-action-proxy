import importlib.util
from pathlib import Path

_api_path = Path(__file__).resolve().parents[1] / 'api.py'
_spec = importlib.util.spec_from_file_location('agentguard_action_proxy_api', str(_api_path))
_module = importlib.util.module_from_spec(_spec)
assert _spec is not None and _spec.loader is not None
_spec.loader.exec_module(_module)

app = _module.app
