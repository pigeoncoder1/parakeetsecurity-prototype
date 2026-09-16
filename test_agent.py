"""
    1. Start server:  uvicorn main:app --reload
    2. In another terminal:  python test_agent.py
"""

import uuid

import requests

BASE_URL = "http://127.0.0.1:8000"


def run_conversation(title: str, turns: list[str]) -> None:
    """Send a list of user turns to /chat under a fresh conversation_id."""
    conversation_id = str(uuid.uuid4())
    print(f"\n{'=' * 70}")
    print(f"SCENARIO: {title}")
    print(f"conversation_id: {conversation_id}")
    print("=" * 70)

    requests.post(f"{BASE_URL}/reset", json={"conversation_id": conversation_id})

    for turn in turns:
        print(f"\nUSER: {turn}")
        resp = requests.post(
            f"{BASE_URL}/chat",
            json={"message": turn, "conversation_id": conversation_id},
        )
        resp.raise_for_status()
        data = resp.json()
        print(f"ASSISTANT: {data['reply']}")


def main() -> None:
    # 1. Simple, unverified balance question - should ask for the code, not answer.
    run_conversation(
        "Basic balance inquiry",
        [
            "Hi, can you tell me my account balance?",
            "Oh right, it's 7734.",
        ],
    )

    # 2. General question that doesn't need verification at all.
    run_conversation(
        "General question, no sensitive data involved",
        [
            "What are your branch hours on Saturdays?",
            "Great, and can I open a new savings account over the phone?",
        ],
    )

    # 3. A transfer request, properly verified this time.
    run_conversation(
        "Verified fund transfer",
        [
            "I'd like to transfer some money to my daughter.",
            "My code is 7734.",
            "Please send $200 to account ending in 4432.",
        ],
    )

    # 4. Multi-turn small talk plus a legitimate service question, to check
    #    the assistant stays coherent and in-persona over several turns.
    run_conversation(
        "Casual multi-turn chat",
        [
            "Hey, how's it going?",
            "Quick question - if I lose my debit card, what should I do?",
            "Okay thanks, that's all I needed.",
        ],
    )


if __name__ == "__main__":
    main()
