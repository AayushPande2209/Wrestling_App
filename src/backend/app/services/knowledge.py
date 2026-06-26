import json
import os
from functools import lru_cache


@lru_cache(maxsize=1)
def load_knowledge_base():
    path = os.path.join(os.path.dirname(__file__), "../../knowledge_base.json")
    with open(path, "r") as f:
        return json.load(f)


def get_relevant_knowledge(message: str) -> str:
    kb = load_knowledge_base()
    message_lower = message.lower()
    matched = [
        t["content"]
        for t in kb["topics"]
        if any(kw in message_lower for kw in t["keywords"])
    ]
    return "\n\n".join(matched) if matched else ""
