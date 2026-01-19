import math
from datetime import datetime


def compute_stability(company_age_days, total_changes, last_change_at):
    # --- force numeric safety ---
    company_age_days = float(company_age_days)
    total_changes = float(total_changes)

    if last_change_at:
        days_since_change = (datetime.utcnow() - last_change_at).days
    else:
        days_since_change = company_age_days

    raw_score = math.log(days_since_change + 1) * (
        company_age_days / (total_changes + 1)
    )

    # normalize + cap
    return round(min(raw_score, 100.0), 2)
