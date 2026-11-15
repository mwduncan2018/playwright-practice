"""Sample data, loaded fresh each time the server starts. Dates count back from the start time."""

from datetime import timedelta

from sqlmodel import Session

from .models import Announcement, Person, RequestEvent, ServiceRequest, utc_now
from .routers.requests import title_for

# username, name, role, job title, department, location, phone
PEOPLE = [
    ("admin1", "Admin One", "admin", "IT Manager", "IT Operations", "Seattle", "+1 206 555 0101"),
    ("admin2", "Admin Two", "admin", "Finance Director", "Finance", "Chicago", "+1 312 555 0102"),
    ("admin3", "Admin Three", "admin", "HR Lead", "Human Resources", "Austin", "+1 512 555 0103"),
    ("admin4", "Admin Four", "admin", "Security Officer", "Security", "Seattle", "+1 206 555 0104"),
    ("standard1", "Standard One", "standard", "Software Engineer", "Engineering", "Seattle", "+1 206 555 0105"),
    ("standard2", "Standard Two", "standard", "Marketing Specialist", "Marketing", "Chicago", "+1 312 555 0106"),
    ("standard3", "Standard Three", "standard", "Account Executive", "Sales", "Austin", "+1 512 555 0107"),
    ("standard4", "Standard Four", "standard", "QA Engineer", "Engineering", "Remote", "+1 206 555 0108"),
]
NAMES = {person[0]: person[1] for person in PEOPLE}


def _equipment(item: str, quantity: int, delivery: str, address: str = "") -> dict:
    return {"type": "Equipment", "item": item, "quantity": quantity, "delivery": delivery, "address": address}


def _software(software: str, license: str, seats: int = 1) -> dict:
    return {"type": "Software", "software": software, "license": license, "seats": seats}


def _access(system: str, level: str, security_justification: str = "") -> dict:
    return {
        "type": "Access",
        "system": system,
        "level": level,
        "security_justification": security_justification,
        "training_completed": level == "Administrator",
    }


# The year before the recent requests: 80 more, all decided or cancelled long ago, so All requests
# starts with 100 rows across several pages. They're made from these templates in turn.
OLDER_REQUEST_COUNT = 80

# details, reason
OLDER_TEMPLATES = [
    (_equipment("Laptop", 1, "Desk"), "My laptop's battery lasts less than an hour away from the charger."),
    (_equipment("Monitor", 1, "Desk"), "A second screen would let me keep the specification open while I work."),
    (_equipment("Keyboard", 1, "Pickup"), "I'd like an ergonomic keyboard after a wrist strain."),
    (_equipment("Mouse", 2, "Desk"), "One mouse for my desk and one for the meeting room laptop."),
    (_equipment("Headset", 1, "Ship", "88 Lake Shore Drive, Chicago, IL 60611"),
     "I work from home on Fridays and join calls all day."),
    (_equipment("Docking station", 1, "Desk"), "I switch between two desks and need a dock at the second one."),
    (_equipment("Webcam", 1, "Pickup"), "My laptop's built-in camera is too dark for customer demos."),
    (_software("Adobe Acrobat Pro", "1 year"), "I edit and sign supplier agreements every week."),
    (_software("Figma", "6 months"), "I'm reviewing the new onboarding screens with the design team."),
    (_software("JetBrains IntelliJ IDEA", "1 year"), "I maintain the Java services for the billing team."),
    (_software("Microsoft Visio", "1 month"), "I need to update the office floor plans before the move."),
    (_software("Miro", "1 year", 5), "Our team of five runs its retrospectives on a shared board."),
    (_software("Tableau", "6 months"), "I'm building the quarterly sales dashboards."),
    (_software("Figma", "1 month"), "I'm helping with one marketing campaign's mockups."),
    (_access("Customer CRM", "Read only"), "I need to look up customer contacts before support calls."),
    (_access("Finance reporting", "Read only"), "I review department spending against the budget each month."),
    (_access("HR records", "Read only"), "I'm checking holiday balances for my team's schedule."),
    (_access("Source code repository", "Read and write"), "I joined the web team and need to push changes."),
    (_access("Production database", "Read only"), "I investigate slow queries that customers report."),
    (_access("Customer CRM", "Read and write"), "I took over a sales territory and need to update its accounts."),
    (_access("Source code repository", "Read only"), "I review pull requests for the documentation site."),
]
OLDER_PRIORITIES = ["Normal", "Low", "High", "Normal", "Urgent"]
OLDER_REJECTIONS = [
    "We have spare stock of this. Pick one up at the IT desk.",
    "This needs your manager's approval first. Ask them to email me, then submit again.",
    "Your team's budget for this quarter is spent. Submit again next quarter.",
    "Please use the tool we already have a site license for.",
]


def _older_requests() -> list[tuple]:
    """Oldest first, a few days apart. Every 10 requests: 8 approved, 1 rejected and 1 cancelled."""
    usernames = [person[0] for person in PEOPLE]
    admins = [person[0] for person in PEOPLE if person[2] == "admin"]
    requests = []
    for index in range(OLDER_REQUEST_COUNT):
        requester = usernames[index % len(usernames)]
        details, reason = OLDER_TEMPLATES[index % len(OLDER_TEMPLATES)]
        days_ago = 41 + (OLDER_REQUEST_COUNT - 1 - index) * 4 + index % 3
        priority = OLDER_PRIORITIES[index % len(OLDER_PRIORITIES)]
        # Admins can't decide their own requests, so another admin does.
        decider = admins[(index // len(usernames)) % len(admins)]
        if decider == requester:
            decider = admins[(admins.index(decider) + 1) % len(admins)]
        if index % 10 == 9:
            outcome = ("Cancelled", None, "")
        elif index % 10 == 7:
            outcome = ("Rejected", decider, OLDER_REJECTIONS[(index // 10) % len(OLDER_REJECTIONS)])
        else:
            outcome = ("Approved", decider, "")
        requests.append((requester, days_ago, priority, dict(details), reason, outcome))
    return requests


# The recent requests, after the older ones: requester, days ago, priority, details, reason, outcome.
# An outcome is (status, deciding admin, note). High and Urgent requests are needed within a week.
RECENT_REQUESTS = [
    ("standard1", 40, "Normal", _equipment("Laptop", 1, "Desk"),
     "My current laptop is five years old and can't run our build tools.", ("Approved", "admin1", "")),
    ("standard2", 35, "Normal", _software("Figma", "1 year"),
     "I design the marketing landing pages and share mockups in Figma.",
     ("Approved", "admin2", "Approved from the marketing budget.")),
    ("standard3", 30, "High", _access("Customer CRM", "Read and write"),
     "I need to update account records for my new sales territory.", ("Approved", "admin1", "")),
    ("standard1", 28, "Low", _software("Microsoft Visio", "6 months"),
     "I want to draw architecture diagrams for our design reviews.",
     ("Rejected", "admin3", "We already have a site license for another diagram tool. Please use that instead.")),
    ("standard4", 25, "Normal", _equipment("Monitor", 2, "Desk"),
     "Two monitors make reviewing test results much faster.", ("Approved", "admin4", "")),
    ("admin1", 22, "Low", _equipment("Docking station", 1, "Pickup"),
     "My docking station stopped charging my laptop.", ("Approved", "admin2", "")),
    ("standard2", 20, "Normal", _access("Finance reporting", "Read only"),
     "I need campaign spend reports to plan next quarter.",
     ("Rejected", "admin2", "Finance reports need your manager's approval first. Ask them to email me, then submit again.")),
    ("standard3", 18, "Normal", _equipment("Headset", 1, "Ship", "455 Oak Avenue, Austin, TX 78701"),
     "I take customer calls from home two days a week.", ("Cancelled", None, "")),
    ("standard1", 15, "High", _access("Source code repository", "Read and write"),
     "I joined the payments team and need to push code to its repository.", ("Approved", "admin4", "")),
    ("admin4", 12, "Urgent",
     _access("Production database", "Administrator", "I need to rotate the database credentials during the maintenance window."),
     "Credential rotation is due before the end of the month.",
     ("Rejected", "admin1", "Production administrator access needs a change ticket. Add one and submit again.")),
    ("standard2", 10, "Low", _equipment("Keyboard", 1, "Desk"),
     "Several keys on my keyboard stick.", ("Approved", "admin3", "")),
    ("standard4", 8, "High", _software("JetBrains IntelliJ IDEA", "1 year"),
     "I'm writing automated tests in Java for the new service.", ("Approved", "admin1", "")),
    ("admin2", 7, "Normal", _software("Tableau", "1 year", 3),
     "The finance team needs dashboards for the 2027 budget.", ("Approved", "admin1", "")),
    ("standard1", 6, "Low", _equipment("Mouse", 1, "Pickup"),
     "The scroll wheel on my mouse is broken.", ("Cancelled", None, "")),
    ("standard3", 5, "Normal", _software("Adobe Acrobat Pro", "1 year"),
     "I need to prepare and sign customer contracts.", ("Submitted", None, "")),
    ("standard1", 4, "High", _equipment("Laptop", 1, "Ship", "1200 Pine Street, Seattle, WA 98101"),
     "I'm moving to the Seattle office and need a laptop there on my first day.", ("Submitted", None, "")),
    ("admin3", 3, "Normal", _access("HR records", "Read and write"),
     "I'm taking over onboarding paperwork from a colleague on leave.", ("Submitted", None, "")),
    ("standard4", 2, "Normal", _access("Customer CRM", "Read only"),
     "I need to read customer records to reproduce reported bugs.", ("Submitted", None, "")),
    ("standard2", 1, "Low", _software("Miro", "6 months"),
     "Our team runs planning workshops on a shared whiteboard.", ("Submitted", None, "")),
    ("standard1", 0.25, "Urgent", _access("Finance reporting", "Read only"),
     "I have to reconcile the payments report before Monday's audit.", ("Submitted", None, "")),
]

# In number order from REQ-1001: the older requests are REQ-1001 to REQ-1080 and the recent ones
# REQ-1081 to REQ-1100.
REQUESTS = _older_requests() + RECENT_REQUESTS

# Request number, hours after the request was made, username, comment
COMMENTS = [
    ("REQ-1084", 22, "standard1", "Thanks, I'll use the other tool."),
    ("REQ-1096", 20, "admin1", "We have a laptop in stock in Seattle. I'll approve it once your manager confirms the move."),
    ("REQ-1096", 26, "standard1", "My manager confirmed the move by email this morning."),
    ("REQ-1098", 5, "admin2", "Which customer accounts do you need to look at?"),
]

# title, body, audience, pinned, days ago, author
ANNOUNCEMENTS = [
    ("Welcome to Super Portal",
     "Super Portal is where you ask for equipment, software and access. Choose New request, pick what you need, "
     "and follow the steps.\nYou can follow every request on My requests.", "Everyone", False, 60, "admin1"),
    ("Laptop refresh program",
     "Laptops older than four years can be replaced this quarter. Request a laptop and say how old your current "
     "one is in the reason.", "Everyone", False, 20, "admin1"),
    ("Tips for tracking your requests",
     "Open any request on My requests to see its history and comments. You can cancel a request until an admin "
     "decides on it.", "Standard users", False, 15, "admin1"),
    ("Security training due by December 15",
     "Everyone must finish this year's security training by December 15. Requests for administrator access "
     "need it.", "Everyone", True, 10, "admin4"),
    ("Budget planning for 2027",
     "Admins: send your team's equipment and software estimates for 2027 to Finance by November 30.",
     "Admins", False, 5, "admin2"),
    ("Office closed for Thanksgiving",
     "All offices are closed on November 26 and 27. Requests submitted then are handled the following Monday.",
     "Everyone", True, 3, "admin3"),
]


def load_sample_data(session: Session) -> None:
    now = utc_now().replace(microsecond=0)

    for username, name, role, title, department, location, phone in PEOPLE:
        session.add(
            Person(
                username=username,
                name=name,
                email=f"{username}@example.com",
                role=role,
                title=title,
                department=department,
                location=location,
                phone=phone,
            )
        )

    records: dict[str, ServiceRequest] = {}
    for requester, days_ago, priority, details, reason, (status, decider, note) in REQUESTS:
        created = now - timedelta(days=days_ago)
        record = ServiceRequest(
            type=details["type"],
            title=title_for(details),
            requester_username=requester,
            requester_name=NAMES[requester],
            status=status,
            priority=priority,
            needed_by=(created + timedelta(days=7)).date() if priority in ("High", "Urgent") else None,
            justification=reason,
            details=details,
            created_at=created,
            updated_at=created,
        )
        session.add(record)
        session.flush()
        records[record.number] = record
        session.add(RequestEvent(request_id=record.id, at=created, username=requester, name=NAMES[requester], kind="Submitted"))
        if decider is not None:
            decided = created + timedelta(hours=20)
            record.decided_by = NAMES[decider]
            record.decided_at = decided
            record.decision_note = note
            record.updated_at = decided
            session.add(RequestEvent(request_id=record.id, at=decided, username=decider, name=NAMES[decider], kind=status, text=note))
        elif status == "Cancelled":
            record.updated_at = created + timedelta(hours=2)
            session.add(RequestEvent(request_id=record.id, at=record.updated_at, username=requester, name=NAMES[requester], kind="Cancelled"))
        session.add(record)

    for number, hours, username, text in COMMENTS:
        record = records[number]
        at = record.created_at + timedelta(hours=hours)
        session.add(RequestEvent(request_id=record.id, at=at, username=username, name=NAMES[username], kind="Comment", text=text))
        record.updated_at = max(record.updated_at, at)
        session.add(record)

    for title, body, audience, pinned, days_ago, author in ANNOUNCEMENTS:
        session.add(
            Announcement(
                title=title,
                body=body,
                audience=audience,
                pinned=pinned,
                publish_at=now - timedelta(days=days_ago),
                author_username=author,
                author_name=NAMES[author],
            )
        )
