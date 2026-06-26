import os
from contextlib import asynccontextmanager

import posthog
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import weight, performance, nutrition, coach

load_dotenv()

_POSTHOG_TOKEN = os.environ.get("POSTHOG_PROJECT_TOKEN", "")
_POSTHOG_HOST = os.environ.get("POSTHOG_HOST", "")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if _POSTHOG_TOKEN:
        posthog.api_key = _POSTHOG_TOKEN
        if _POSTHOG_HOST:
            posthog.host = _POSTHOG_HOST

    yield

    if _POSTHOG_TOKEN:
        posthog.flush()


app = FastAPI(title="Wrestling App ML API", version="0.1.0", lifespan=lifespan)

_frontend_url = os.environ.get("FRONTEND_URL", "")
_origins = ["http://localhost:5173"]
if _frontend_url:
    _origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weight.router, prefix="/predict", tags=["weight"])
app.include_router(performance.router, prefix="/predict", tags=["performance"])
app.include_router(nutrition.router, prefix="/predict", tags=["nutrition"])
app.include_router(coach.router, prefix="/coach", tags=["coach"])


@app.get("/health")
def health():
    return {"status": "ok"}
