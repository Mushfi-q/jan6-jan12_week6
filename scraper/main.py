import asyncio
from scraper.browser import launch_browser
from scraper.index_collector import collect_company_urls
from scraper.profile_extractor import extract_company_profile
from scraper.normalizer import normalize_snapshot
from scraper.hasher import compute_snapshot_hash
from scraper.logger import get_logger

from scraper.batches import get_all_batches
#from scraper.batch_discovery import discover_batches

from scraper.db import get_connection
from scraper.repositories.company_repo import (
    get_company_by_yc_id,
    insert_company,
    update_company_seen,
)
from scraper.repositories.snapshot_repo import (
    get_latest_snapshot,
    insert_snapshot,
)
from scraper.change_detector import detect_and_store_changes

logger = get_logger()


def snapshot_row_to_dict(row):
    """
    Convert snapshot DB row → dict for comparison
    Column order must match SELECT *
    """
    return {
        "batch": row[2],
        "stage": row[3],
        "description": row[4],
        "location": row[5],
        "tags": row[6],
        "employee_range": row[7],
    }


async def run():
    
    logger.info("Scraper started")


    



    playwright, browser, context, page = await launch_browser()
    conn = get_connection()

    seen_company_ids = set()

    try:
        # STEP 1: Discover valid YC batches dynamically
        batches = get_all_batches()
        logger.info(f"Generated {len(batches)} batches")

        all_companies = {}

        for batch in batches:
            try:
                companies = await collect_company_urls(page, batch)
                logger.info(f"{batch}: {len(companies)} companies found")

                for c in companies:
                    all_companies[c["url"]] = c["batch"]

            except Exception as e:
                logger.error(f"Failed batch {batch}: {e}")

        logger.info(f"Total unique companies discovered: {len(all_companies)}")

        # STEP 3: Process each company (Phase 2 logic)
        for url, batch_from_index in all_companies.items():
            try:
                # ---- Extract + normalize ----
                raw = await extract_company_profile(page, url)
                snapshot = normalize_snapshot(raw)
                snapshot["batch"] = batch_from_index

                required_fields = ["name"]

                for f in required_fields:
                    if not snapshot.get(f):
                        raise ValueError(f"Missing required field: {f}")

                snapshot_hash = compute_snapshot_hash(snapshot)

                yc_company_id = snapshot["profile_url"].rstrip("/").split("/")[-1]
                name = snapshot["name"]
                domain = snapshot["domain"]

                existing = get_company_by_yc_id(conn, yc_company_id)

                if existing is None:
                    #  New company
                    company_id = insert_company(
                        conn, yc_company_id, name, domain
                    )

                    insert_snapshot(
                        conn, company_id, snapshot, snapshot_hash
                    )

                    seen_company_ids.add(company_id)
                    logger.info(f"NEW company: {name}")

                else:
                    company_id = existing["id"]
                    seen_company_ids.add(company_id)

                    update_company_seen(conn, company_id)

                    last_snapshot = get_latest_snapshot(conn, company_id)

                    if last_snapshot is None:
                        insert_snapshot(
                            conn, company_id, snapshot, snapshot_hash
                        )

                    elif last_snapshot[9] != snapshot_hash:
                        old_snapshot = snapshot_row_to_dict(last_snapshot)

                        insert_snapshot(
                            conn, company_id, snapshot, snapshot_hash
                        )

                        detect_and_store_changes(
                            conn,
                            company_id,
                            old_snapshot,
                            snapshot,
                        )

                        logger.info(f"UPDATED company: {name}")

                conn.commit()

            except Exception as e:
                conn.rollback()
                logger.error(
                    f"Failed company {url} | {str(e)}",
                    exc_info=True,
                )

        # STEP 4: Mark disappeared companies
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE companies
                SET is_active = false
                WHERE id NOT IN %s
                """,
                (tuple(seen_company_ids) or (0,),),
            )
            conn.commit()

        logger.info("Scraper completed successfully")

    finally:
        conn.close()
        await browser.close()
        await playwright.stop()


if __name__ == "__main__":
    asyncio.run(run())
