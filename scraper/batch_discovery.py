import asyncio
from urllib.parse import unquote, urlparse, parse_qs

from scraper.logger import get_logger

logger = get_logger()

BASE_URL = "https://www.ycombinator.com/companies"


async def discover_batches(page):
    """
    Discover valid YC batch names by scanning batch-filter URLs.
    Returns list like:
    ['Fall 2025', 'Winter 2025', 'Summer 2024', ...]
    """
    logger.info("Discovering YC batches")

    await page.goto(BASE_URL, wait_until="networkidle", timeout=60000)
    await asyncio.sleep(3)  # allow hydration

    anchors = await page.query_selector_all("a[href*='?batch=']")

    batches = set()

    for a in anchors:
        href = await a.get_attribute("href")
        if not href:
            continue

        # Parse batch from URL
        parsed = urlparse(href)
        params = parse_qs(parsed.query)

        if "batch" in params:
            raw = params["batch"][0]
            batch = unquote(raw).strip()
            if batch:
                batches.add(batch)

    batches = sorted(batches)

    logger.info(f"Discovered batches: {batches}")
    return batches
