from playwright.async_api import async_playwright

async def launch_browser():
    playwright = await async_playwright().start()
    browser = await playwright.chromium.launch(
        headless=False,     # 👈 IMPORTANT
        slow_mo=50          # 👈 helps observe rendering
    )
    context = await browser.new_context(
        viewport={"width": 1280, "height": 800},
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    )
    page = await context.new_page()
    return playwright, browser, context, page
