import importlib.util
from pathlib import Path

_legacy_path = Path(__file__).resolve().parents[1] / 'audit.py'
_spec = importlib.util.spec_from_file_location('agentguard._legacy_audit', str(_legacy_path))
_module = importlib.util.module_from_spec(_spec)
assert _spec is not None and _spec.loader is not None
_spec.loader.exec_module(_module)

AuditRecord = _module.AuditRecord
MerkleAuditLog = _module.MerkleAuditLog
