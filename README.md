# NazarovGroup

Готовая к развёртыванию первая версия коммерческого сайта детейлинг-центра: адаптивная публичная часть, каталог услуг, запись по свободным слотам, защищённая админ-панель, PostgreSQL, гарантированная доставка Telegram-уведомлений через outbox и Docker-инфраструктура.

Оплата пока намеренно не подключена: новая запись сразу получает статус `confirmed`. Контент, Hero, услуги, портфолио, контакты и юридические страницы редактируются из админ-панели; изображения и данные сохраняются между перезапусками.

## Стек

- Frontend: Next.js 16, React 19, TypeScript strict, App Router, Tailwind CSS 4, React Hook Form, Zod, TanStack Query, Framer Motion, Lucide.
- Backend: Python 3.12+, FastAPI, Pydantic 2, SQLAlchemy 2 async, Alembic, asyncpg.
- Database: PostgreSQL 17.
- Telegram: aiogram 3, отдельный health endpoint.
- Infrastructure: Docker, Docker Compose, Nginx.

## Архитектура

```text
Browser
  └─ Nginx :80
      ├─ /api/* → FastAPI :8000 → PostgreSQL :5432 (internal only)
      ├─ /media/* → FastAPI media storage
      └─ /*      → Next.js :3000

FastAPI notification worker → PostgreSQL outbox → Bot :8081 → Telegram API
```

Frontend не знает о persistence и обращается к backend через интерфейс `services/booking-api.ts`. HTTP handlers остаются тонкими: validation находится в Pydantic schemas, сценарии — в `app/services`, persistence — в SQLAlchemy models. Создание записи и события уведомления происходит одной DB-транзакцией. Bot отвечает только за доставку и не дублирует правила бронирования.

Подробнее: [docs/architecture.md](docs/architecture.md).

## Структура репозитория

```text
.
├── frontend/              # Next.js App Router
│   ├── public/            # локальные assets, включая social preview
│   └── src/
│       ├── app/           # страницы, metadata, robots, sitemap
│       ├── components/    # reusable UI и секции
│       ├── data/          # mock data/config вместо разметки с hardcode
│       ├── schemas/       # Zod validation
│       └── services/      # HTTP boundaries
├── backend/
│   ├── app/
│   │   ├── api/           # HTTP routers
│   │   ├── core/          # settings
│   │   ├── db/            # engine/session
│   │   ├── models/        # SQLAlchemy entities
│   │   ├── schemas/       # Pydantic DTO
│   │   └── services/      # будущие use cases
│   └── alembic/           # migrations
├── bot/                   # отдельный aiogram process
├── nginx/                 # reverse proxy и security headers
├── docs/                  # архитектурные заметки
├── docker-compose.yml
└── .env.example
```

## Prerequisites

Для полного запуска нужен Docker Engine с Compose. Для запуска компонентов без Docker:

- Node.js 24+ и npm 11+;
- Python 3.12–3.13;
- PostgreSQL 16+.

## Быстрый запуск через Docker

1. Создайте локальный env-файл:

   ```bash
   cp .env.example .env
   ```

   В PowerShell: `Copy-Item .env.example .env`.

2. Обязательно замените `POSTGRES_PASSWORD` и `JWT_SECRET`. Для Telegram заполните `TELEGRAM_BOT_TOKEN` и отрицательный `TELEGRAM_GROUP_CHAT_ID`; ЮKassa можно оставить пустой.

3. Соберите и запустите:

   ```bash
   docker compose up --build
   ```

4. Откройте:

   - сайт: `http://localhost`;
   - админ-панель: `http://localhost/admin`;
   - health: `http://localhost/api/health`;
   - Swagger в development: `http://localhost/api/docs`.

PostgreSQL и внутренний endpoint бота не публикуются на host. Данные сохраняются в named volume `postgres_data`, изображения — в `media_data`. Bot без token запускается в health-only режиме, а уведомления остаются в outbox и повторяются после настройки.

### Изображения и автоматическая оптимизация

Администратор загружает исходный JPG, PNG или WebP до 8 МБ. Backend проверяет реальное содержимое и разрешение файла, отклоняет анимацию и потенциально опасные изображения, исправляет EXIF-ориентацию, удаляет метаданные и создаёт WebP-варианты шириной 640, 1280 и 1920 px без увеличения маленьких оригиналов. Frontend автоматически выбирает подходящий вариант через responsive `srcset`: телефону не приходится скачивать desktop-файл.

Файлы получают непредсказуемые имена и хранятся в `media_data`, а Nginx раздаёт их с immutable cache headers. После сохранения контента заменённые изображения удаляются. Незавершённые загрузки старше суток очищаются при следующей загрузке. Старые изображения, созданные до появления этого конвейера, продолжат работать; для получения всех преимуществ их достаточно один раз перезагрузить через админ-панель.

Volume `media_data` необходимо включить в резервное копирование VPS вместе с `postgres_data`. Команда `docker compose down` безопасна для данных, но `docker compose down -v` удаляет оба volume без возможности восстановления.

Локальные admin credentials лежат в игнорируемом файле `.env.admin`. Перед передачей проекта или публикацией обязательно замените пароль и signing secret. Репозиторий содержит только безопасный шаблон переменных.

Остановка: `docker compose down`. Удаление volume выполняйте только осознанно: `docker compose down -v` необратимо удалит локальную базу.

## Environment variables

| Переменная | Назначение |
|---|---|
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Инициализация PostgreSQL |
| `DATABASE_URL` | Async SQLAlchemy URL (`postgresql+asyncpg://...`) |
| `ENVIRONMENT` | `development` / `production` |
| `DOCS_ENABLED` | Включает `/api/docs` и OpenAPI |
| `CORS_ORIGINS` | Разрешённые origins через запятую |
| `NEXT_PUBLIC_API_URL` | Публичный base URL API, фиксируется при frontend build |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin для sitemap/metadata |
| `TELEGRAM_BOT_TOKEN` | Token от BotFather; пустое значение включает health-only режим |
| `TELEGRAM_GROUP_CHAT_ID` | Отрицательный ID рабочей Telegram-группы; личные chat ID отклоняются |
| `TELEGRAM_PROXY_URL` | Необязательный SOCKS5/HTTP proxy для исходящих запросов к Telegram API |
| `BOT_INTERNAL_SECRET` | Секрет backend → bot, минимум 32 случайных символа в production |
| `BUSINESS_TIMEZONE` | Часовой пояс расписания, например `Asia/Yekaterinburg` |
| `BOOKING_OPEN_TIME`, `BOOKING_CLOSE_TIME` | Рабочее окно в формате `HH:MM` |
| `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` | Зарезервированы для будущей интеграции |
| `JWT_SECRET` | Секрет подписи admin-сессии, минимум 32 случайных символа |
| `ADMIN_USERNAME` | Логин администратора |
| `ADMIN_PASSWORD` | Допустим только для локальной разработки; в production должен быть пустым |
| `ADMIN_PASSWORD_HASH` | PBKDF2-SHA256 хеш пароля, обязателен в production |
| `ADMIN_SESSION_TTL_SECONDS` | Срок жизни сессии, по умолчанию 8 часов |
| `ADMIN_COOKIE_SECURE` | В production обязательно `true` для HTTPS-only cookie |
| `HTTP_PORT` | Host-порт Nginx, по умолчанию `80` |

Secrets нельзя коммитить. `.env` уже исключён через `.gitignore`.

## Frontend без Docker

```bash
cd frontend
npm ci
npm run dev
```

Проверки:

```bash
npm run typecheck
npm run lint
npm run build
npm run format:check
```

`src/data` используется как безопасный fallback, если API временно недоступен. В рабочем режиме главная, каталог `/services` и legal pages получают контент из API. На главной выводится не более шести отмеченных услуг; полный список имеет поиск и постраничный вывод, поэтому страница не растёт бесконечно.

SEO-основа включает Metadata API, OpenGraph/X image, canonical base, `robots.txt`, `sitemap.xml` и semantic sections. Для LocalBusiness JSON-LD сначала добавьте подтверждённые адрес, город, координаты и график в конфигурацию — вымышленные данные использовать нельзя.

Frontend не загружает шрифты из Google во время сборки: системный стек делает локальную, CI- и VPS-сборку воспроизводимой даже при ограниченном доступе к зарубежным CDN.

## Backend без Docker

Из директории `backend`:

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Локальный `DATABASE_URL` должен указывать на доступный PostgreSQL. Основные endpoints:

- `GET /api/health`;
- `GET /api/content` — публичный контент;
- `GET /api/bookings/availability?service_id=...&date=YYYY-MM-DD` — свободные слоты;
- `POST /api/bookings` — создать подтверждённую запись без оплаты;
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session`;
- `GET/PUT /api/admin/content`;
- `GET /api/admin/bookings`, `PATCH /api/admin/bookings/{id}/status`;
- `GET /api/admin/bookings/export.xlsx` — защищённая XLSX-выгрузка заказов и сводной статистики;
- `POST /api/admin/media` — безопасная загрузка и автоматическая подготовка responsive WebP;
- `/api/payments`;
- `/api/webhooks/yookassa`.

Остальные router boundaries не возвращают фиктивные ответы до появления use cases.

Для генерации production-хеша пароля выполните внутри backend environment:

```bash
python -m app.cli.hash_password
```

Результат положите в `ADMIN_PASSWORD_HASH`. При использовании Docker Compose в env-файле символ `$` нужно записывать как `$$`.

## Миграции

Docker применяет `alembic upgrade head` перед запуском API. Вручную из `backend`:

```bash
alembic upgrade head
alembic current
alembic revision --autogenerate -m "describe change"
```

Первая migration создаёт базовые `services`, `bookings` и PostgreSQL enum `booking_status`. Вторая добавляет JSONB-хранилище управляемого контента. Третья расширяет запись публичными данными и добавляет transactional outbox. Четвёртая добавляет обязательные марку/модель и цвет автомобиля без потери старых записей. Перед коммитом новой migration просмотрите generated SQL и проверьте downgrade.

## Telegram bot

Локально из `bot`:

```bash
pip install -r requirements.txt
python -m app.main
```

Health endpoint: `GET :8081/health` внутри Docker-сети. Уведомления направляются только в одну настроенную группу. Положительные ID личных чатов бот отклоняет.

1. Откройте официальный `@BotFather`, выполните `/newbot`, задайте имя и username и скопируйте token.
2. Добавьте бота в закрытую рабочую группу. Права администратора не нужны, если обычным участникам разрешено отправлять сообщения.
3. Положите token в `TELEGRAM_BOT_TOKEN` файла `.env`, а `BOT_INTERNAL_SECRET` замените случайной строкой не короче 32 символов.
4. Запустите bot без chat ID: `docker compose up -d --build bot`.
5. В группе отправьте `/start` или `/start@username_бота`. Бот ответит отрицательным ID группы, обычно вида `-1001234567890`.
6. Запишите его в `TELEGRAM_GROUP_CHAT_ID` файла `.env` и пересоздайте сервисы: `docker compose up -d --force-recreate bot backend`.
7. Проверьте `docker compose logs --tail=100 bot backend`. Новая тестовая запись с сайта должна один раз появиться в группе.

Если `/start` отправить боту лично, он не выдаст личный chat ID и предложит перейти в группу. Не публикуйте `.env` и token, не добавляйте их в Git и не присылайте в переписку. После новой записи бот получает только необходимые для обработки заявки поля. Если Telegram временно недоступен, backend хранит событие в PostgreSQL outbox и повторяет доставку с увеличивающейся задержкой. При преобразовании обычной группы в супергруппу Telegram может изменить ID; тогда повторите `/start` в группе и обновите `TELEGRAM_GROUP_CHAT_ID`.

Если `api.telegram.org:443` недоступен из сети VDS, укажите в production `.env` защищённый proxy, например `TELEGRAM_PROXY_URL=socks5://user:password@proxy-host:port`. Поддерживаются HTTP tunneling, SOCKS4(a) и SOCKS5. Не используйте публичные бесплатные proxy: адрес и credentials должны храниться только в `.env` с правами `600`. После изменения переменной пересоздайте bot-контейнер или повторно запустите deployment; обычный restart не перечитывает environment.

## CI/CD

Репозиторий содержит готовые эквивалентные pipeline для GitHub Actions и GitLab CI: проверки выполняются на pull/merge request, после merge в основную ветку строятся и публикуются три Docker-образа, а production разворачивается на VPS по точному SHA коммита. Полная настройка секретов, registry, VPS, ручной запуск и rollback описаны в [docs/ci-cd.md](docs/ci-cd.md).

## Production notes

- Завершить TLS на внешнем load balancer или добавить HTTPS server в Nginx.
- Установить сильные secrets через secret manager/VPS environment, не через репозиторий.
- Установить `ENVIRONMENT=production`, `DOCS_ENABLED=false`, точные `CORS_ORIGINS` и HTTPS `NEXT_PUBLIC_SITE_URL`.
- Установить `ADMIN_COOKIE_SECURE=true`, новый `JWT_SECRET` и только `ADMIN_PASSWORD_HASH`; backend откажется стартовать при небезопасной production-конфигурации.
- Добавить резервное копирование PostgreSQL, retention и проверку восстановления.
- Текущий календарь резервирует один общий ресурс детейлинг-центра в пределах рабочего дня. Для услуг длительностью несколько дней `duration_minutes` сейчас задаёт блок первого рабочего дня; перед полностью автоматическим многодневным расписанием добавить `end_date` и сущность `work_bay`.
- Webhook ЮKassa должен проверять источник/статус, быть идемпотентным и не доверять данным frontend.
- Перед несколькими администраторами добавить таблицу пользователей, роли, отзыв сессий и audit log; текущая модель рассчитана на одного владельца.
- Для нескольких экземпляров backend outbox уже использует `FOR UPDATE SKIP LOCKED`; при большом потоке можно вынести worker в отдельный процесс.
- Pipeline уже проверяет frontend/backend/bot и публикует immutable Docker images; production secrets должны храниться только в GitHub Environment или GitLab protected variables и на VPS.

## Следующий этап

1. Утвердить реальные услуги, контакты, адрес и юридические тексты.
2. Установить production-домен, TLS и резервное копирование с тестом восстановления.
3. Добавить несколько рабочих постов/мастеров, если услуги должны выполняться параллельно.
4. Подключить ЮKassa deposit flow и идемпотентный webhook.
5. Перед командной админкой добавить пользователей, роли, отзыв сессий и audit log.
6. Добавить мониторинг ошибок, метрики доставки outbox и внешние uptime-проверки.
