import re
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Russian → Latin transliteration map
TRANSLIT_MAP = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "kh", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


def generate_slug(name: str) -> str:
    """Transliterate Russian name to URL-friendly slug."""
    result = []
    for char in name.lower():
        if char in TRANSLIT_MAP:
            result.append(TRANSLIT_MAP[char])
        elif char.isascii() and (char.isalnum() or char == "-"):
            result.append(char)
        else:
            result.append("-")
    slug = "-".join(part for part in "".join(result).split("-") if part)
    return slug


async def ensure_unique_slug(session: AsyncSession, model, slug: str) -> str:
    """Ensure slug is unique for the given model, adding -1, -2, etc. if needed."""
    base_slug = slug
    counter = 0
    while True:
        candidate = f"{base_slug}-{counter}" if counter else base_slug
        result = await session.execute(
            select(model.id).where(model.slug == candidate)
        )
        if result.scalar_one_or_none() is None:
            return candidate
        counter += 1
