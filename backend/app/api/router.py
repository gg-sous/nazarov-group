from fastapi import APIRouter

from app.api.routes import admin, bookings, content, health, payments, services, webhooks

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
