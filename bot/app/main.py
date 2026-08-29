import asyncio
import hmac
import html
import logging
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from aiogram import Bot, Dispatcher, Router
from aiogram.enums import ChatType
from aiogram.filters import CommandStart
from aiogram.types import Message
from aiohttp import web

LOGGER = logging.getLogger("nazarovgroup.bot")
router = Router()


@router.message(CommandStart())
async def start_command(message: Message) -> None:
    if message.chat.type not in {ChatType.GROUP, ChatType.SUPERGROUP}:
        await message.answer(
            "Добавьте бота в рабочую группу NazarovGroup и отправьте там /start. "
            "Уведомления о записях в личные сообщения не отправляются."
        )
        return
    await message.answer(
        "NazarovGroup bot работает.\n"
        f"ID этой группы: <code>{message.chat.id}</code>\n\n"
        "Укажите его в TELEGRAM_GROUP_CHAT_ID и перезапустите сервис bot.",
        parse_mode="HTML",
    )


def _required_text(payload: dict[str, Any], field: str, limit: int) -> str:
    value = payload.get(field)
    if not isinstance(value, str) or not value.strip() or len(value) > limit:
        raise web.HTTPBadRequest(text=f"Invalid {field}")
    return value.strip()


def _group_chat_id_from_env(raw_value: str) -> int | None:
    if not raw_value:
        return None
    try:
        chat_id = int(raw_value)
    except ValueError:
        LOGGER.error("TELEGRAM_GROUP_CHAT_ID must be an integer")
        return None
    if chat_id >= 0:
        LOGGER.error(
            "TELEGRAM_GROUP_CHAT_ID must be a negative group/supergroup ID; "
            "private chat IDs are rejected"
        )
        return None
    return chat_id


async def health(request: web.Request) -> web.Response:
    return web.json_response(
        {
            "status": "ok",
            "notifications_configured": (
                request.app["bot"] is not None and bool(request.app["chat_id"])
            ),
        }
    )


async def booking_notification(request: web.Request) -> web.Response:
    expected_secret: str = request.app["internal_secret"]
    supplied_secret = request.headers.get("X-Internal-Secret", "")
    if not expected_secret or not hmac.compare_digest(supplied_secret, expected_secret):
        raise web.HTTPUnauthorized(text="Unauthorized")
    bot: Bot | None = request.app["bot"]
    chat_id: int | None = request.app["chat_id"]
    if bot is None or chat_id is None:
        raise web.HTTPServiceUnavailable(text="Telegram notifications are not configured")
    try:
        payload = await request.json()
    except ValueError as exc:
        raise web.HTTPBadRequest(text="Invalid JSON") from exc
    if not isinstance(payload, dict):
        raise web.HTTPBadRequest(text="Invalid payload")

    booking_id = _required_text(payload, "booking_id", 64)
    client_name = _required_text(payload, "client_name", 120)
    client_phone = _required_text(payload, "client_phone", 32)
    service_name = _required_text(payload, "service_name", 160)
    booking_date = _required_text(payload, "date", 10)
    start_time = _required_text(payload, "start_time", 5)
    end_time = _required_text(payload, "end_time", 5)
    message = (
        "<b>Новая запись NazarovGroup</b>\n\n"
        f"Клиент: {html.escape(client_name)}\n"
        f"Телефон: <code>{html.escape(client_phone)}</code>\n"
        f"Услуга: {html.escape(service_name)}\n"
        f"Дата: {html.escape(booking_date)}\n"
        f"Время: {html.escape(start_time)}–{html.escape(end_time)}\n"
        f"ID: <code>{html.escape(booking_id)}</code>"
    )
    await bot.send_message(chat_id=chat_id, text=message, parse_mode="HTML")
    LOGGER.info("Booking notification delivered for booking %s", booking_id)
    return web.json_response({"status": "sent"})


@asynccontextmanager
async def notification_server(
    port: int,
    bot: Bot | None,
    chat_id: int | None,
    secret: str,
) -> AsyncIterator[None]:
    app = web.Application(client_max_size=64 * 1024)
    app["bot"] = bot
    app["chat_id"] = chat_id
    app["internal_secret"] = secret
    app.router.add_get("/health", health)
    app.router.add_post("/notifications/booking", booking_notification)
    runner = web.AppRunner(app, access_log=None)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    LOGGER.info("Notification service started on port %s", port)
    try:
        yield
    finally:
        await runner.cleanup()


async def main() -> None:
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO"),
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = _group_chat_id_from_env(os.getenv("TELEGRAM_GROUP_CHAT_ID", "").strip())
    internal_secret = os.getenv("BOT_INTERNAL_SECRET", "").strip()
    health_port = int(os.getenv("BOT_HEALTH_PORT", "8081"))
    bot = Bot(token=token) if token else None
    polling_task: asyncio.Task[None] | None = None
    if bot is None or chat_id is None:
        LOGGER.warning(
            "Telegram token or valid group chat id is missing; "
            "notifications will be retried by backend"
        )
    try:
        if bot is not None:
            dispatcher = Dispatcher()
            dispatcher.include_router(router)
            polling_task = asyncio.create_task(
                dispatcher.start_polling(bot, close_bot_session=False)
            )
            LOGGER.info("Telegram polling started; send /start in the target group to obtain its ID")
        async with notification_server(health_port, bot, chat_id, internal_secret):
            await asyncio.Event().wait()
    finally:
        if polling_task is not None:
            polling_task.cancel()
            await asyncio.gather(polling_task, return_exceptions=True)
        if bot is not None:
            await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
