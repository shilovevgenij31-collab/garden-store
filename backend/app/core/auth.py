import hashlib
import hmac
import secrets
import time
from typing import Optional

import bcrypt as _bcrypt

from fastapi import Request, HTTPException

from .config import settings
from .logging import logger

# ---------------------------------------------------------------------------
# Password hashing  (uses bcrypt directly — passlib has compat issues)
# ---------------------------------------------------------------------------

_password_hash: bytes | None = None


def _resolve_password_hash() -> bytes:
    if settings.ADMIN_PASSWORD_HASH:
        return settings.ADMIN_PASSWORD_HASH.encode("utf-8")

    if settings.ADMIN_PASSWORD:
        logger.warning(
            "ADMIN_PASSWORD is set as plain text — this is insecure. "
            "Generate a bcrypt hash with:  python scripts/hash_password.py  "
            "and set ADMIN_PASSWORD_HASH in .env instead."
        )
        return _bcrypt.hashpw(
            settings.ADMIN_PASSWORD.encode("utf-8"), _bcrypt.gensalt()
        )

    raise RuntimeError(
        "Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is configured. "
        "Set one in your .env file."
    )


def verify_admin_password(password: str) -> bool:
    """Verify admin password against bcrypt hash."""
    global _password_hash
    if _password_hash is None:
        _password_hash = _resolve_password_hash()

    if not password:
        return False

    return _bcrypt.checkpw(password.encode("utf-8"), _password_hash)


# ---------------------------------------------------------------------------
# Token management (HMAC-signed, no extra dependencies)
# ---------------------------------------------------------------------------

_secret_key: str | None = None


def _get_secret_key() -> str:
    """Return a stable secret key for signing tokens."""
    global _secret_key
    if _secret_key is None:
        if settings.SECRET_KEY:
            _secret_key = settings.SECRET_KEY
        else:
            _secret_key = secrets.token_hex(32)
            logger.warning(
                "SECRET_KEY is not configured — using a random key. "
                "Tokens will be invalidated on server restart. "
                "Set SECRET_KEY in .env for persistent tokens."
            )
    return _secret_key


def create_admin_token() -> str:
    """Create an HMAC-signed admin token with expiration timestamp."""
    expire = int(time.time()) + settings.TOKEN_EXPIRE_HOURS * 3600
    payload = f"admin:{expire}"
    signature = hmac.new(
        _get_secret_key().encode(), payload.encode(), hashlib.sha256
    ).hexdigest()
    return f"{payload}:{signature}"


def verify_admin_token(token: str) -> bool:
    """Verify an admin token's signature and expiration."""
    parts = token.split(":")
    if len(parts) != 3:
        return False

    role, expire_str, signature = parts

    if role != "admin":
        return False

    try:
        expire = int(expire_str)
    except ValueError:
        return False

    if time.time() > expire:
        return False

    expected = hmac.new(
        _get_secret_key().encode(), f"{role}:{expire_str}".encode(), hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(signature, expected)


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------

async def get_admin_user(request: Request) -> str:
    """FastAPI dependency: verify admin access via Bearer token."""
    auth_header = request.headers.get("Authorization", "")

    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        if verify_admin_token(token):
            return "admin"

    raise HTTPException(status_code=401, detail="Неверный или истёкший токен")
