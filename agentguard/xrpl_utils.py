import binascii
import json
from typing import Any


def str_to_hex(value: str) -> str:
    """Convert UTF-8 string to XRPL hex blob."""
    return binascii.hexlify(value.encode("utf-8")).decode("ascii").upper()


def hex_to_str(value: str) -> str:
    return binascii.unhexlify(value).decode("utf-8")


def canonical_json_text(data: Any) -> str:
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
