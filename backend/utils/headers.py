from typing import Dict, Any
from .user_agents import get_random_agent


def get_headers(extra: Dict[str, Any] = {}) -> Dict[str, str]:
    headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-GB,en;q=0.9,ja-JP;q=0.8,ja;q=0.7,en-US;q=0.6",
        "user-agent": get_random_agent(),
    }
    for key, val in extra.items():
        headers[key] = val
    return headers

