import asyncio
from scraper.logger import get_logger

logger = get_logger()


async def extract_company_profile(page, url):
    logger.info(f"Extracting profile: {url}")

    await page.goto(url, wait_until="networkidle", timeout=60000)
    await asyncio.sleep(0.5)

    data = {
        "profile_url": url,
        "name": None,
        "domain": None,
        "batch": None,
        "stage": None,
        "description": None,
        "location": None,
        "employee_range": None,
        "tags": [],
        "founders": [],
        "social_links": {},
    }

    # ---------- NAME ----------
    h1 = await page.query_selector("h1")
    if h1:
        data["name"] = (await h1.inner_text()).strip()

    # ---------- DESCRIPTION ----------
    desc_el = await page.query_selector(
        "div.prose.max-w-full.whitespace-pre-line"
    )
    if desc_el:
        data["description"] = (await desc_el.inner_text()).strip()

    # ---------- METADATA (Batch, Status, Location, Team Size) ----------
    rows = await page.query_selector_all(
        "div.flex.flex-row.justify-between"
    )

    for row in rows:
        spans = await row.query_selector_all("span")
        if len(spans) != 2:
            continue

        key = (await spans[0].inner_text()).strip().replace(":", "").lower()
        value = (await spans[1].inner_text()).strip()

        if key == "batch":
            data["batch"] = value
        elif key == "status":
            data["stage"] = value
        elif key == "location":
            data["location"] = value
        elif key in ("team size", "employees"):
            data["employee_range"] = value

    # ---------- DOMAIN / WEBSITE ----------
    links = await page.query_selector_all("a[href]")
    for a in links:
        href = await a.get_attribute("href")
        if not href:
            continue

        if href.startswith("http") and "ycombinator.com" not in href:
            data["domain"] = href
            break

    # ---------- SOCIAL LINKS ----------
    for a in links:
        href = await a.get_attribute("href")
        if not href:
            continue

        if "linkedin.com" in href:
            data["social_links"]["linkedin"] = href
        elif "twitter.com" in href or "x.com" in href:
            data["social_links"]["twitter"] = href

    # ---------- TAGS / INDUSTRIES ----------
    tag_links = await page.query_selector_all(
        "a[href*='/companies?industry=']"
    )
    for tag in tag_links:
        t = (await tag.inner_text()).strip()
        if t:
            data["tags"].append(t)

    # ---------- FOUNDERS ----------
    founder_links = await page.query_selector_all(
        "a[href*='/people/']"
    )
    for f in founder_links:
        name = (await f.inner_text()).strip()
        if name:
            data["founders"].append(name)

    return data
