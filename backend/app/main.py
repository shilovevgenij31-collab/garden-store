from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.exceptions import HTTPException as StarletteHTTPException

from .core.config import settings
from .core.database import engine
from .core.logging import setup_logging, RequestLoggingMiddleware, logger
from .core.exceptions import (
    AppError,
    app_error_handler,
    http_error_handler,
    validation_error_handler,
    unhandled_error_handler,
)
from .models import Base
from .routers import (
    health_router,
    categories_router,
    products_router,
    orders_router,
    admin_router,
    admin_login_router,
)


# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Starting Garden Store API (env=%s, debug=%s)", settings.ENV, settings.DEBUG)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed data if DB is empty
    from .seed import seed_if_empty
    await seed_if_empty()

    logger.info("Database ready")
    yield

    await engine.dispose()
    logger.info("Shutting down")


app = FastAPI(
    title="Всё в сад — API",
    description="API интернет-магазина садовых товаров",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-Admin-Password", "Authorization"],
)

# Request logging
app.add_middleware(RequestLoggingMiddleware)

# Error handlers
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(StarletteHTTPException, http_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(Exception, unhandled_error_handler)

# Static files for uploads
uploads_dir = Path(settings.UPLOAD_DIR)
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Routers
app.include_router(health_router)
app.include_router(categories_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(admin_login_router)
app.include_router(admin_router)


# Rate limit decorators for specific routes
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Apply rate limits to specific endpoints."""
    response = await call_next(request)
    return response
