from datetime import datetime, timedelta

def recency_factor(last_change_at):
    if not last_change_at:
        return 0.1

    days = (datetime.utcnow() - last_change_at).days

    if days <= 30:
        return 1.0
    elif days <= 90:
        return 0.7
    elif days <= 180:
        return 0.4
    return 0.1


def compute_momentum(changes, last_change_at):
    """
    changes: list of change_type strings
    """
    stage_changes = sum(1 for c in changes if c == "STAGE_CHANGE")
    tag_changes = sum(1 for c in changes if c == "TAG_CHANGE")
    location_changes = sum(1 for c in changes if c == "LOCATION_CHANGE")

    base_score = (
        stage_changes * 3 +
        tag_changes * 1 +
        location_changes * 0.5 +
        len(changes)
    )

    return base_score * recency_factor(last_change_at)
