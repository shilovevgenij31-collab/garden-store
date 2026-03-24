import json
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    ENV: str = "development"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite+aiosqlite:///./garden.db"

    FRONTEND_URL: str = "http://localhost:5173"
    BASE_URL: str = "http://localhost:8000"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:8080"]

    ADMIN_PASSWORD: str = ""  # Deprecated: use ADMIN_PASSWORD_HASH instead
    ADMIN_PASSWORD_HASH: str = ""  # bcrypt hash (generate via: python backend/scripts/hash_password.py)

    SECRET_KEY: str = ""  # Used to sign admin tokens; auto-generated if empty
    TOKEN_EXPIRE_HOURS: int = 24  # Admin token lifetime in hours

    RATE_LIMIT_ADMIN_LOGIN: str = "5/minute"

    UPLOAD_DIR: str = "./uploads"
    STORAGE_BACKEND: str = "local"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_MIME_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp"]

    RATE_LIMIT_ORDERS: str = "5/minute"
    RATE_LIMIT_PRODUCTS: str = "60/minute"

    YOOKASSA_SHOP_ID: str = ""
    YOOKASSA_SECRET_KEY: str = ""

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
