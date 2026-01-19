def get_all_batches():
    """
    Generate all YC batch names in the format expected by
    https://www.ycombinator.com/companies?batch=...

    Example:
    - Winter 2024
    - Summer 2023
    - Fall 2022
    """
    batches = []

    START_YEAR = 2009
    END_YEAR = 2026  # safe upper bound

    for year in range(START_YEAR, END_YEAR + 1):
        batches.append(f"Winter {year}")
        batches.append(f"Summer {year}")

        # Fall batches were introduced later
        if year >= 2012:
            batches.append(f"Fall {year}")

    return batches
