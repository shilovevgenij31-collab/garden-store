from decimal import Decimal
from sqlalchemy import select

from .core.database import async_session
from .core.logging import logger
from .models import Category, Product


CATEGORIES = [
    {"name": "Цветы", "slug": "flowers", "icon": "🌸", "sort_order": 1},
    {"name": "Рассада", "slug": "seedlings", "icon": "🌱", "sort_order": 2},
    {"name": "Инструменты", "slug": "tools", "icon": "🛠️", "sort_order": 3},
    {"name": "Декор", "slug": "decor", "icon": "🏡", "sort_order": 4},
    {"name": "Семена", "slug": "seeds", "icon": "🌾", "sort_order": 5},
]

PRODUCTS = [
    {
        "name": "Роза английская «Абрахам Дерби»",
        "slug": "roza-angliyskaya-abrakham-derbi",
        "category_slug": "flowers",
        "price": Decimal("1290"),
        "old_price": Decimal("1590"),
        "badge": "Хит",
        "image_url": "/images/product1.jpg",
        "description": "Роскошная английская роза с крупными абрикосово-розовыми цветками и насыщенным фруктовым ароматом.",
    },
    {
        "name": "Лаванда узколистная",
        "slug": "lavanda-uzkolistnaya",
        "category_slug": "flowers",
        "price": Decimal("490"),
        "old_price": None,
        "badge": None,
        "image_url": "/images/product2.jpg",
        "description": "Ароматное многолетнее растение с фиолетовыми соцветиями. Идеально для бордюров и альпийских горок.",
    },
    {
        "name": "Гортензия крупнолистная",
        "slug": "gortenziya-krupnolistnaya",
        "category_slug": "flowers",
        "price": Decimal("1890"),
        "old_price": Decimal("2200"),
        "badge": "Скидка",
        "image_url": "/images/product3.jpg",
        "description": "Великолепный кустарник с шаровидными соцветиями. Цвет зависит от кислотности почвы.",
    },
    {
        "name": "Пион травянистый",
        "slug": "pion-travyanistyy",
        "category_slug": "flowers",
        "price": Decimal("950"),
        "old_price": None,
        "badge": None,
        "image_url": "/images/product4.jpg",
        "description": "Многолетник с пышными махровыми цветками и приятным ароматом. Украшение любого сада.",
    },
    {
        "name": "Лейка садовая латунная",
        "slug": "leyka-sadovaya-latunnaya",
        "category_slug": "tools",
        "price": Decimal("2490"),
        "old_price": None,
        "badge": "Новинка",
        "image_url": "/images/product5.jpg",
        "description": "Стильная латунная лейка объёмом 5 литров. Долговечная и красивая — украсит ваш сад.",
    },
    {
        "name": "Клематис «Виль де Лион»",
        "slug": "klematis-vil-de-lion",
        "category_slug": "flowers",
        "price": Decimal("780"),
        "old_price": Decimal("990"),
        "badge": "Скидка",
        "image_url": "/images/product6.jpg",
        "description": "Красивоцветущая лиана с яркими карминово-красными цветками. Идеальна для вертикального озеленения.",
    },
    {
        "name": "Набор секаторов Premium",
        "slug": "nabor-sekatorov-premium",
        "category_slug": "tools",
        "price": Decimal("3450"),
        "old_price": Decimal("4200"),
        "badge": "Хит",
        "image_url": "/images/product7.jpg",
        "description": "Профессиональный набор из 3 секаторов с эргономичными ручками и японской сталью.",
    },
    {
        "name": "Жасмин садовый",
        "slug": "zhasmin-sadovyy",
        "category_slug": "flowers",
        "price": Decimal("690"),
        "old_price": None,
        "badge": None,
        "image_url": "/images/product8.jpg",
        "description": "Кустарник с белоснежными цветками и невероятным ароматом. Неприхотлив и морозостоек.",
    },
    {
        "name": "Семена лаванды",
        "slug": "semena-lavandy",
        "category_slug": "seeds",
        "price": Decimal("190"),
        "old_price": None,
        "badge": None,
        "image_url": "/images/cat-seeds.jpg",
        "description": "Высококачественные семена лаванды узколистной. Упаковка 0.5г (~200 семян).",
    },
    {
        "name": "Рассада петуний (6 шт)",
        "slug": "rassada-petuniy-6sht",
        "category_slug": "seedlings",
        "price": Decimal("350"),
        "old_price": None,
        "badge": None,
        "image_url": "/images/cat-seedlings.jpg",
        "description": "Крепкая рассада петуний смесь окрасок. 6 штук в кассете, готова к высадке.",
    },
    {
        "name": "Декоративный фонарь",
        "slug": "dekorativnyy-fonar",
        "category_slug": "decor",
        "price": Decimal("1850"),
        "old_price": Decimal("2300"),
        "badge": "Скидка",
        "image_url": "/images/cat-decor.jpg",
        "description": "Кованый садовый фонарь на солнечной батарее. Высота 60см, тёплый свет.",
    },
    {
        "name": "Букет из садовых роз",
        "slug": "buket-iz-sadovykh-roz",
        "category_slug": "flowers",
        "price": Decimal("2990"),
        "old_price": None,
        "badge": "Хит",
        "image_url": "/images/cat-flowers.jpg",
        "description": "Роскошный букет из 11 садовых роз разных сортов. Собран вручную нашими флористами.",
    },
]


async def seed_if_empty():
    """Seed database with initial data if empty."""
    async with async_session() as session:
        result = await session.execute(select(Category.id).limit(1))
        if result.scalar_one_or_none() is not None:
            logger.info("Database already seeded, skipping")
            return

        logger.info("Seeding database with initial data...")

        # Create categories
        cat_map = {}
        for cat_data in CATEGORIES:
            cat = Category(**cat_data)
            session.add(cat)
            cat_map[cat_data["slug"]] = cat

        await session.flush()  # Get category IDs

        # Create products
        for prod_data in PRODUCTS:
            data = {**prod_data}
            category_slug = data.pop("category_slug")
            category = cat_map[category_slug]
            product = Product(category_id=category.id, **data)
            session.add(product)

        await session.commit()
        logger.info("Seeded %d categories and %d products", len(CATEGORIES), len(PRODUCTS))
