import json
from datetime import datetime, timezone

import anthropic

_claude = anthropic.Anthropic()

PROFILE_UPDATE_PROMPT = """You are analyzing a single conversation turn between a wrestler and their weight cut coach.

Current wrestler profile:
{current_profile}

The conversation that just happened:
User: {user_message}
Coach: {coach_response}

Based ONLY on this exchange, identify any NEW information worth adding to the wrestler's profile that isn't already there. Look for:
- Food preferences (likes, dislikes, what they usually eat)
- Observations about their cut habits or patterns
- Personal notes about how their body responds to cutting
- Any relevant lifestyle info (school schedule, practice times, etc.)

If there is genuinely new information worth storing, return a JSON object with only the fields that should be updated:
{{
  "food_likes": ["item"],
  "food_dislikes": ["item"],
  "cut_habits": ["observation"],
  "observations": ["note"]
}}

If there is nothing new worth storing, return exactly: null

Return ONLY valid JSON or null. No explanation, no preamble."""


def maybe_update_profile(
    wrestler_id: str,
    current_profile: dict,
    user_message: str,
    coach_response: str,
    supabase,
) -> None:
    try:
        response = _claude.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            messages=[{
                "role": "user",
                "content": PROFILE_UPDATE_PROMPT.format(
                    current_profile=json.dumps(current_profile, indent=2),
                    user_message=user_message,
                    coach_response=coach_response,
                ),
            }],
        )

        result_text = response.content[0].text.strip()
        if result_text == "null" or not result_text:
            return

        updates = json.loads(result_text)
        if not updates:
            return

        merged = dict(current_profile)
        for key in ["food_likes", "food_dislikes", "cut_habits", "observations"]:
            if key in updates and updates[key]:
                existing = set(merged.get(key) or [])
                new_items = [item for item in updates[key] if item not in existing]
                if new_items:
                    merged[key] = list(existing) + new_items

        merged["updated_at"] = datetime.now(timezone.utc).isoformat()

        supabase.table("wrestlers").update(
            {"wrestler_profile": merged}
        ).eq("id", wrestler_id).execute()

    except Exception:
        pass
