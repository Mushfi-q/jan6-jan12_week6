from scraper.logger import get_logger

logger = get_logger()

async def extract_company_profile(page, url):
    await page.goto(url, timeout=60000)

    def text(selector):
        el = page.locator(selector)
        return el.first.text_content() if el else None

    data = {
        "profile_url": url,
        "name": await text("h1"),
        "domain": None,
        "batch": None,
        "stage": None,
        "description": None,
        "location": None,
        "tags": [],
        "employee_range": None,
    }

    logger.info(f"Extracted raw data for {url}")
    return data
