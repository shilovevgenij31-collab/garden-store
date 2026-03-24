from .health import router as health_router
from .categories import router as categories_router
from .products import router as products_router
from .orders import router as orders_router
from .admin import router as admin_router, login_router as admin_login_router

__all__ = [
    "health_router",
    "categories_router",
    "products_router",
    "orders_router",
    "admin_router",
    "admin_login_router",
]
