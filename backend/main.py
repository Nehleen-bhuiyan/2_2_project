from fastapi import FastAPI
from sqlalchemy import text
from fastapi.staticfiles import StaticFiles
from routes.register_route import router as register_router
from routes.login_route import router as login_router
from routes.user_route import router as user_router
from routes.project_route import router as project_router
from routes.audio_route import router as audio_router
from fastapi.staticfiles import (
    StaticFiles,
)
from routes.export_route import (router as export_router,
)
from routes.preview_route import (router as preview_router,
)
from config.db import engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT 1")
        )

        value = result.scalar()

    return {
        "database": "connected",
        "result": value
    }

app.mount(
    "/storage",
    StaticFiles(directory="storage"),
    name="storage"
)
app.include_router(
    register_router,
    prefix="/api"
)
app.include_router(
    login_router,
    prefix="/api",
)
app.include_router(
    user_router,
    prefix="/api",
)
app.include_router(
    project_router,
    prefix="/api"
)
app.include_router(
    audio_router,
    prefix="/api"
)
app.include_router(
    preview_router,
    prefix="/api",
)
app.include_router(
    export_router,
    prefix="/api",
)
#uvicorn main:app --reload