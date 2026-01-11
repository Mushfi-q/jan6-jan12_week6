import asyncio
from scraper.logger import get_logger
from urllib.parse import quote_plus

logger = get_logger()

YC_URL = "https://www.ycombinator.com/companies"

def build_batch_url(batch_name):
    encoded = quote_plus(batch_name)
    return f"{YC_URL}?batch={encoded}"

async def collect_company_urls(page,batch_name):
    logger.info("Opening YC companies index page")
    url = build_batch_url(batch_name)
    logger.info(f"Opening YC batch page: {batch_name}")
    await page.goto(url, wait_until="networkidle", timeout=60000)

    # allow React hydration
    await asyncio.sleep(3)

    seen = set()
    prev_count = -1

    # force initial render
    for _ in range(3):
        await page.mouse.wheel(0, 3000)
        await asyncio.sleep(1.5)

    while True:
        cards = await page.query_selector_all('a[class*="_company_"]')

        for card in cards:
            href = await card.get_attribute("href")
            if href:
                seen.add("https://www.ycombinator.com" + href)

        logger.info(f"Discovered companies: {len(seen)}")

        if len(seen) == prev_count:
            break

        prev_count = len(seen)
        await page.mouse.wheel(0, 4000)
        await asyncio.sleep(2)

    logger.info(f"Final company count: {len(seen)}")
    return list(seen)
