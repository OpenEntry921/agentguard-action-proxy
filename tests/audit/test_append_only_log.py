import json
from pathlib import Path

from agentguard.audit import append_audit_receipt


def test_append_only_log_appends_without_overwrite(tmp_path):
    p = tmp_path / "logs" / "audit_receipts.jsonl"
    append_audit_receipt({"audit_receipt": {"receipt_id": "1"}}, p)
    append_audit_receipt({"audit_receipt": {"receipt_id": "2"}}, p)
    lines = p.read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 2
    assert json.loads(lines[0])["audit_receipt"]["receipt_id"] == "1"
    assert json.loads(lines[1])["audit_receipt"]["receipt_id"] == "2"
