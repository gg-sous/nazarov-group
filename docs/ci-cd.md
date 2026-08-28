# CI/CD NazarovGroup

Проект содержит два эквивалентных pipeline: GitHub Actions (`.github/workflows/ci-cd.yml`) и GitLab CI (`.gitlab-ci.yml`). Одновременно использовать оба не требуется — выбирается платформа, где хранится основной Git-репозиторий.

## Общая схема

```text
pull request / merge request
  ├─ frontend: npm ci → ESLint → TypeScript → Next production build
  ├─ backend: install → Ruff → pytest
  └─ bot: install → Ruff → compileall

merge в main
  └─ после успешного quality gate
      ├─ build frontend image
      ├─ build backend image
      ├─ build bot image
      └─ push immutable :<commit-sha> и удобный :latest

production deploy
  ├─ передать compose/nginx на VPS
  ├─ login VPS в registry
  ├─ pull образов с точным commit SHA
  └─ docker compose up -d → healthchecks → migrations → запуск
```

Деплой использует неизменяемый тег commit SHA, поэтому `latest` не участвует в production-запуске. Это исключает ситуацию, когда одинаковый тег внезапно указывает на другой образ.

## GitHub Actions

Workflow запускает quality jobs для pull request и push. После merge в `main` публикует три образа в GHCR. Кнопка **Actions → CI and delivery → Run workflow** на ветке `main` повторно запускает полный pipeline вручную:

```text
ghcr.io/<owner>/<repo>/frontend:<commit-sha>
ghcr.io/<owner>/<repo>/backend:<commit-sha>
ghcr.io/<owner>/<repo>/bot:<commit-sha>
```

Создайте GitHub Environment `production`, включите required reviewers и добавьте repository variables:

```text
ENABLE_DEPLOY=true
PRODUCTION_URL=https://example.ru
```

Environment/repository secrets:

| Secret | Назначение |
|---|---|
| `VPS_HOST` | DNS или IP сервера |
| `VPS_USER` | Непривилегированный deploy-пользователь |
| `VPS_SSH_KEY` | Закрытый ключ deploy-пользователя |
| `VPS_KNOWN_HOSTS` | Проверенная строка host key сервера |
| `VPS_DEPLOY_PATH` | Например `/opt/nazarovgroup` |
| `GHCR_USERNAME` | Registry user/read-only deploy user |
| `GHCR_PULL_TOKEN` | GitHub PAT (classic) только со scope `read:packages` |

Встроенный `GITHUB_TOKEN` публикует образы. Отдельный pull token нужен только VPS. `PRODUCTION_URL` формирует canonical, robots и sitemap во время сборки frontend и не является secret. Production job будет недоступен до прохождения правил GitHub Environment.

## GitLab CI

Quality jobs работают аналогично. Docker-in-Docker собирает три образа в GitLab Container Registry с тегами `$CI_COMMIT_SHA` и `latest`. GitLab автоматически предоставляет CI-job credentials для публикации.

Добавьте protected/masked CI/CD variables:

```text
VPS_HOST
VPS_USER
VPS_SSH_KEY
VPS_KNOWN_HOSTS
VPS_DEPLOY_PATH
REGISTRY_PULL_USER
REGISTRY_PULL_PASSWORD
PRODUCTION_URL
```

Создайте Deploy Token с правом `read_registry` и используйте его как `REGISTRY_PULL_USER`/`REGISTRY_PULL_PASSWORD`. Job `deploy-production` намеренно имеет `when: manual`: после зелёного pipeline оператор нажимает Deploy. Для автоматического запуска удалите эту строку. Команда `docker compose up --wait` ждёт healthchecks до 180 секунд, поэтому незапустившийся API или неудачная миграция делают deploy job красным.

## Первичная подготовка VPS

1. Установить Docker Engine с Compose plugin.
2. Создать deploy-пользователя с минимально необходимым доступом к Docker.
3. Создать каталог `/opt/nazarovgroup` и production `.env` внутри него.
4. Поставить внешний TLS reverse proxy или изменить Nginx для HTTPS. Production compose публикует Nginx только на `127.0.0.1:8080`.
5. Настроить резервные копии volumes `postgres_data` и `media_data`.

Обязательные production variables включают PostgreSQL credentials, `JWT_SECRET`, `ADMIN_PASSWORD_HASH`, `ADMIN_COOKIE_SECURE=true`, точные `CORS_ORIGINS`, Telegram credentials, `BOT_INTERNAL_SECRET`, часовой пояс и рабочее время.

## Миграции и отказ

Backend-контейнер выполняет `alembic upgrade head` до запуска приложения. Если миграция или healthcheck падает, зависимые сервисы не переходят в healthy.

Для rollback укажите предыдущий commit SHA и повторно выполните:

```bash
IMAGE_PREFIX=<registry/project> IMAGE_TAG=<previous-sha> docker compose -f docker-compose.prod.yml up -d
```

Откат приложения не означает автоматический downgrade базы. Миграции проектируются backward-compatible; опасные schema changes должны выполняться отдельными expand/migrate/contract релизами.
