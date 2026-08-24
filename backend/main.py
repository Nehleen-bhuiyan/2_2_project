from fastapi import FastAPI
from sqlalchemy import text

from routes.register_route import router as register_router
from routes.login_route import router as login_router
from routes.user_route import router as user_router
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
#uvicorn main:app --reload