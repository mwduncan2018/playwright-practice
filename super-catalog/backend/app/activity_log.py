"""The activity log: who created, changed or deleted what, and when."""

from sqlmodel import Session

from .auth import User
from .models import Activity


def record(
    session: Session, user: User, action: str, entity_type: str, entity_id: int, label: str, details: str = ""
) -> None:
    session.add(
        Activity(
            username=user.username,
            user_display_name=user.name,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_label=label,
            details=details,
        )
    )


def describe_changes(
    before: dict[str, object], after: dict[str, object], labels: dict[str, str], summarized: frozenset[str] = frozenset()
) -> str:
    """For example "Price: 19.99 → 24.99; Stock: 5 → 12". Long fields only say they changed."""
    parts = []
    for key, label in labels.items():
        old, new = before.get(key), after.get(key)
        if old == new:
            continue
        parts.append(f"{label} changed" if key in summarized else f"{label}: {_show(old)} → {_show(new)}")
    return "; ".join(parts)


def _show(value: object) -> str:
    if value is None or value == "":
        return "(none)"
    if isinstance(value, float):
        return f"{value:.2f}"
    return str(value)
