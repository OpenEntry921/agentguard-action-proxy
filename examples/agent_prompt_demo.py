import requests

API_URL = "http://127.0.0.1:8000/agent/request"


def ask(prompt: str, default: str) -> str:
    value = input(f"{prompt} [{default}]: ").strip()
    return value or default


def main() -> None:
    print("=== AgentGuard AI Agent 요청 데모 ===")
    payload = {
        "agent_id": ask("Agent ID", "did:openentry:agent:treasury-01"),
        "action": ask("Action", "xrpl_payment"),
        "amount": int(ask("Amount (drops)", "1000000")),
        "destination": ask("Destination", "rnAo7npmjoMhAuYZtnGGjAffsJJPxs3sHk"),
        "purpose": ask("Purpose", "treasury"),
        "reason": ask("Reason", "vendor payment"),
        "context": {},
    }

    res = requests.post(API_URL, json=payload, timeout=30)
    print("\n=== 처리 결과 ===")
    print(res.json())


if __name__ == "__main__":
    main()
