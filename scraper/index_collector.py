import asyncio
from urllib.parse import quote_plus
from scraper.logger import get_logger

logger = get_logger()

BASE_URL = "https://www.ycombinator.com/companies"


def build_batch_url(batch_name):
    encoded = quote_plus(batch_name)
    return f"{BASE_URL}?batch={encoded}"


async def collect_company_urls(page, batch_name):
    """
    Returns a list of dicts:
    [
      {"url": ".../companies/ontop", "batch": "Summer 2021"},
      ...
    ]
    """
    url = build_batch_url(batch_name)
    logger.info(f"Opening YC batch page: {batch_name}")

    await page.goto(url, wait_until="networkidle", timeout=60000)

    # short hydration wait (2s → 0.8s)
    await asyncio.sleep(0.8)

    companies = {}
    prev_count = -1
    stable_rounds = 0

    while True:
        cards = await page.query_selector_all('a[class*="_company_"]')

        for card in cards:
            href = await card.get_attribute("href")
            if href and href.startswith("/companies/"):
                full_url = "https://www.ycombinator.com" + href
                companies[full_url] = batch_name

        current_count = len(companies)
        logger.info(f"{batch_name}: discovered {current_count} companies")

        # stop when no growth for 2 scrolls
        if current_count == prev_count:
            stable_rounds += 1
        else:
            stable_rounds = 0

        if stable_rounds >= 2:
            break

        prev_count = current_count

        # lighter scroll
        await page.mouse.wheel(0, 2500)
        await asyncio.sleep(0.7)

    logger.info(f"{batch_name}: final company count {len(companies)}")

    # return list of {url, batch}
    return [{"url": u, "batch": b} for u, b in companies.items()]
