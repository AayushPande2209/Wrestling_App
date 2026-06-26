<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Pursuit wrestling app's FastAPI backend. PostHog is initialized in the app lifespan context manager (`main.py`) using `posthog.api_key` and `posthog.host` from environment variables, with `posthog.flush()` called on shutdown. Nine events are now captured across four routers, covering the full athlete journey from weight-cut planning through AI coach engagement. Every capture uses the wrestler's Supabase UUID (`user["sub"]`) as the distinct ID, ensuring server-side events tie back to the correct person.

| Event | Description | File |
|---|---|---|
| `weight_cut_predicted` | Wrestler requests a weight-cut plan; tracks `lbs_to_cut`, `days_until_weigh_in`, `is_safe` | `src/backend/app/routers/weight.py` |
| `weight_trend_predicted` | Wrestler requests a weight projection for a target date; tracks `confidence`, `data_points` | `src/backend/app/routers/weight.py` |
| `performance_trend_viewed` | Wrestler fetches their win-rate trend; tracks `trend` direction and `total_matches` | `src/backend/app/routers/performance.py` |
| `match_outcome_predicted` | Wrestler requests a match-outcome prediction; tracks `confidence` and `win_probability` | `src/backend/app/routers/performance.py` |
| `meal_plan_generated` | Wrestler generates a personalized meal plan; tracks `target_calories` and `sodium_warning` | `src/backend/app/routers/nutrition.py` |
| `recovery_protocol_requested` | Wrestler requests post-weigh-in recovery guidance; tracks `lbs_cut` and `hours_until_match` | `src/backend/app/routers/nutrition.py` |
| `coach_onboarding_completed` | Wrestler finishes AI coach onboarding — top of the coach engagement funnel | `src/backend/app/routers/coach.py` |
| `coach_message_sent` | Wrestler sends a chat message to the AI coach; tracks `message_length` and `messages_today` | `src/backend/app/routers/coach.py` |
| `coach_daily_limit_reached` | Wrestler hits the 45-message daily limit — churn and engagement ceiling signal | `src/backend/app/routers/coach.py` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/473735/dashboard/1722579)
- [Coach Adoption Funnel](https://us.posthog.com/project/473735/insights/hEtkIPqY) — conversion from onboarding → first message
- [Daily Coach Engagement](https://us.posthog.com/project/473735/insights/qozTfEqx) — unique users messaging the coach per day
- [Prediction Feature Usage](https://us.posthog.com/project/473735/insights/0n6rTvmD) — side-by-side usage of all four prediction tools
- [Daily Limit Hit Rate](https://us.posthog.com/project/473735/insights/2gr0HtTg) — how often wrestlers hit the coach message ceiling
- [Performance Trend Views](https://us.posthog.com/project/473735/insights/11m2i06K) — unique athletes checking win-rate and match predictions per week

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` to `.env.example` and any deployment/bootstrap scripts (Fly.io secrets, CI environment config) so collaborators and CI know what to set.
- [ ] Confirm the returning-visitor path also calls identify — currently distinct IDs come from `user["sub"]` (Supabase UUID) on every authenticated request, which is correct, but verify the frontend correlates the same UUID so client-side and server-side events merge on the same person profile.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
