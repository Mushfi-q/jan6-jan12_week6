def get_all_batches():
    batches = []

    # YC batches from ~2009 onward
    for year in range(9, 26):  # 2009 → 2025
        batches.append(f"W{year:02d}")
        batches.append(f"S{year:02d}")

    return batches
