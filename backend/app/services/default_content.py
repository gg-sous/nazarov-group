from app.schemas.content import SiteContentBundle

DEFAULT_SITE_CONTENT = SiteContentBundle.model_validate(
    {
        "hero": {
            "eyebrow": "Профессиональный детейлинг",
            "accent": "NazarovGroup",
            "title": "Характер в деталях",
            "description": (
                "Возвращаем автомобилю выразительность и защищаем результат — аккуратно, "
                "технологично, с вниманием к каждой поверхности."
            ),
            "primary_button": "Записаться на осмотр",
            "secondary_button": "Наши работы",
            "image_url": "/og.png",
        },
        "services": [
            {
                "id": "complex-detailing",
                "marker": "01",
                "title": "Комплексный детейлинг",
                "description": (
                    "Глубокий уход за кузовом и салоном по единому технологическому процессу."
                ),
                "price_from": "от 25 000 ₽",
                "is_active": True,
                "is_featured": True,
                "sort_order": 10,
            },
            {
                "id": "body-polishing",
                "marker": "02",
                "title": "Полировка кузова",
                "description": (
                    "Коррекция мелких дефектов и восстановление глубины заводского цвета."
                ),
                "price_from": "от 15 000 ₽",
                "is_active": True,
                "is_featured": True,
                "sort_order": 20,
            },
            {
                "id": "ceramic-coating",
                "marker": "03",
                "title": "Керамическое покрытие",
                "description": (
                    "Защитный состав для выразительного блеска и упрощённого ухода за кузовом."
                ),
                "price_from": "от 18 000 ₽",
                "is_active": True,
                "is_featured": True,
                "sort_order": 30,
            },
            {
                "id": "interior-cleaning",
                "marker": "04",
                "title": "Химчистка салона",
                "description": (
                    "Деликатная очистка материалов салона с вниманием к труднодоступным зонам."
                ),
                "price_from": "от 12 000 ₽",
                "is_active": True,
                "is_featured": True,
                "sort_order": 40,
            },
            {
                "id": "detail-wash",
                "marker": "05",
                "title": "Детейлинг-мойка",
                "description": (
                    "Безопасная многоэтапная мойка кузова, дисков, проёмов и внешних деталей."
                ),
                "price_from": "от 3 500 ₽",
                "is_active": True,
                "is_featured": True,
                "sort_order": 50,
            },
            {
                "id": "protective-coatings",
                "marker": "06",
                "title": "Защитные покрытия",
                "description": "Подбор составов для кузова, стекла, дисков, кожи и текстиля.",
                "price_from": "от 5 000 ₽",
                "is_active": True,
                "is_featured": True,
                "sort_order": 60,
            },
        ],
        "portfolio": [
            {
                "id": "body",
                "title": "Глубина цвета",
                "category": "Кузов",
                "treatment": "Полировка + защита",
                "tone": "black",
                "image_url": None,
            },
            {
                "id": "interior",
                "title": "Чистая фактура",
                "category": "Салон",
                "treatment": "Деликатная химчистка",
                "tone": "silver",
                "image_url": None,
            },
            {
                "id": "finish",
                "title": "Защищённый блеск",
                "category": "Покрытие",
                "treatment": "Керамический состав",
                "tone": "graphite",
                "image_url": None,
            },
        ],
        "contacts": {
            "phone": "+7 (000) 000-00-00",
            "phone_href": "tel:+70000000000",
            "address": "Адрес будет указан перед открытием записи",
            "schedule": "Ежедневно, по предварительной записи",
            "telegram": "https://t.me/",
            "vk": "https://vk.com/",
            "email": "hello@nazarovgroup.ru",
        },
        "legal": [
            {
                "slug": "privacy",
                "title": "Политика обработки персональных данных",
                "body": (
                    "Юридический текст будет добавлен и проверен специалистом перед "
                    "production-запуском сайта."
                ),
            },
            {
                "slug": "personal-data-consent",
                "title": "Согласие на обработку персональных данных",
                "body": (
                    "Юридический текст будет добавлен и проверен специалистом перед "
                    "production-запуском сайта."
                ),
            },
            {
                "slug": "offer",
                "title": "Публичная оферта",
                "body": (
                    "Юридический текст будет добавлен и проверен специалистом перед "
                    "production-запуском сайта."
                ),
            },
            {
                "slug": "requisites",
                "title": "Реквизиты",
                "body": "Фактические реквизиты будут добавлены перед production-запуском сайта.",
            },
        ],
    }
)
