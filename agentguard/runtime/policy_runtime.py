from typing import Any, Dict


def evaluate_with_engine(engine: Any, *args: Any, **kwargs: Any) -> Dict[str, Any]:
    return engine.evaluate_policy(*args, **kwargs)
