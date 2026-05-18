from agentguard.gateway import AgentGuardGateway
from agentguard.policy import Policy
from agentguard.proxy import ExecutionProxy, MockExternalAPI


def test_proxy_executes_once_and_rejects_replay():
    gateway = AgentGuardGateway(
        Policy(max_amount=100, allowed_merchants={"Stripe"}, allowed_purposes={"SaaS"}, allowed_actions={"pay_invoice"})
    )
    proxy = ExecutionProxy(gateway, MockExternalAPI(api_key="sk_test_hidden"))

    token = gateway.request_execution(
        "did:openentry:agent:001",
        {"action": "pay_invoice", "amount": 50, "merchant": "Stripe", "purpose": "SaaS"},
    )

    result = proxy.execute_payment(token)
    assert result.ok is True
    assert result.external_response["status"] == "charged"

    replay = proxy.execute_payment(token)
    assert replay.ok is False
    assert "replay_detected" in replay.message
