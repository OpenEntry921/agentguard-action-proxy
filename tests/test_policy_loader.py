from agentguard.policy_loader import load_policy_from_json


def test_load_policy_from_json():
    policy = load_policy_from_json("policies/travel_spending_policy.json")

    assert policy.max_amount == 300
    assert "HotelExpress" in policy.allowed_merchants
    assert "book_hotel" in policy.allowed_actions
