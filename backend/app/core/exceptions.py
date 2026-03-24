from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from .logging import logger


class AppError(Exception):
    def __init__(self, detail: str, code: str, status: int = 400):
        self.detail = detail
        self.code = code
        self.status = status


class ProductNotFoundError(AppError):
    def __init__(self, product_id: int | None = None):
        detail = f"Товар не найден" + (f" (id={product_id})" if product_id else "")
        super().__init__(detail=detail, code="PRODUCT_NOT_FOUND", status=404)


class CategoryNotFoundError(AppError):
    def __init__(self, category_id: int | None = None):
        detail = f"Категория не найдена" + (f" (id={category_id})" if category_id else "")
        super().__init__(detail=detail, code="CATEGORY_NOT_FOUND", status=404)


class OrderDuplicateError(AppError):
    def __init__(self):
        super().__init__(
            detail="Похожий заказ уже был создан менее минуты назад",
            code="ORDER_DUPLICATE",
            status=409,
        )


class OrderInvalidStatusTransition(AppError):
    def __init__(self, current: str, target: str):
        super().__init__(
            detail=f"Невозможен переход статуса: {current} → {target}",
            code="INVALID_STATUS_TRANSITION",
            status=400,
        )


def error_response(detail: str, code: str, status: int) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"detail": detail, "code": code, "status": status},
    )


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return error_response(exc.detail, exc.code, exc.status)


async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return error_response(
        str(exc.detail),
        "HTTP_ERROR",
        exc.status_code,
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    details = "; ".join(
        f"{'.'.join(str(l) for l in e['loc'])}: {e['msg']}" for e in errors
    )
    return error_response(details, "VALIDATION_ERROR", 422)


async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error: %s %s", request.method, request.url.path)
    from .config import settings
    detail = str(exc) if settings.DEBUG else "Внутренняя ошибка сервера"
    return error_response(detail, "INTERNAL_ERROR", 500)
