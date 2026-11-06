"""Sample data, loaded fresh each time the server starts. Dates count back from the start time."""

from datetime import datetime, timedelta

from sqlmodel import Session

from .models import Activity, Category, Product, Supplier, utc_now

# SKU prefix, name, description
CATEGORIES = [
    ("ELE", "Electronics", "Devices, accessories and cables"),
    ("HOM", "Home & Kitchen", "Cookware, tableware and goods for the home"),
    ("OFF", "Office Supplies", "Stationery, paper and office equipment"),
    ("OUT", "Outdoor", "Camping and hiking gear"),
    ("SPO", "Sports & Fitness", "Exercise equipment and sporting goods"),
    ("TOY", "Toys & Games", "Toys, puzzles and games for all ages"),
]

# name, contact, email, phone, country
SUPPLIERS = [
    ("Blue Harbor Supply", "Maya Chen", "maya.chen@blueharbor.example", "+1 206 555 0141", "United States"),
    ("Cedar & Pine Co.", "Liam Walsh", "liam@cedarpine.example", "+1 604 555 0187", "Canada"),
    ("Delta Components", "Priya Nair", "priya.nair@deltacomponents.example", "+44 20 7946 0321", "United Kingdom"),
    ("Evergreen Goods", "Jonas Becker", "j.becker@evergreen.example", "+49 30 5550 1234", "Germany"),
    ("Falcon Distribution", "Sofia Ramirez", "sofia@falcondist.example", "+52 55 5550 4412", "Mexico"),
    ("Granite Works", "Kenji Sato", "k.sato@graniteworks.example", "+81 3 5550 7788", "Japan"),
    ("Harbor Light Imports", "Olivia Brown", "olivia.brown@harborlight.example", "+61 2 5550 9012", "Australia"),
    ("Ironwood Trading", "Noah Fischer", "noah@ironwood.example", "+1 312 555 0199", "United States"),
]

# name, price, stock, status: in SKU order, so Electronics starts at ELE-1001. Every product's
# reorder level is 10, so stock of 10 or less is low.
PRODUCTS = {
    "ELE": [
        ("USB-C Charging Cable", 12.99, 240, "Active"),
        ("Wireless Mouse", 24.99, 85, "Active"),
        ("Mechanical Keyboard", 89.00, 32, "Active"),
        ("Noise-Cancelling Headphones", 199.99, 8, "Active"),
        ("Bluetooth Speaker", 59.50, 41, "Active"),
        ("27-inch Monitor", 279.00, 15, "Active"),
        ("HD Webcam", 49.99, 5, "Active"),
        ("Portable SSD 1TB", 109.00, 27, "Active"),
        ("Smart Plug", 19.99, 0, "Discontinued"),
        ("Power Bank 20000mAh", 39.99, 64, "Draft"),
    ],
    "HOM": [
        ("Ceramic Coffee Mug", 9.99, 310, "Active"),
        ("Chef's Knife", 64.00, 22, "Active"),
        ("Nonstick Frying Pan", 34.95, 9, "Active"),
        ("Glass Food Containers (Set of 5)", 29.99, 48, "Active"),
        ("Electric Kettle", 44.99, 17, "Active"),
        ("Bamboo Cutting Board", 18.50, 73, "Active"),
        ("Cotton Bath Towel", 14.99, 120, "Active"),
        ("French Press", 27.00, 3, "Active"),
        ("LED Desk Lamp", 32.99, 26, "Draft"),
        ("Stainless Water Bottle", 21.99, 95, "Active"),
    ],
    "OFF": [
        ("Ballpoint Pens (12 pack)", 6.49, 500, "Active"),
        ("Spiral Notebook A5", 3.99, 420, "Active"),
        ("Sticky Notes (6 pads)", 5.25, 260, "Active"),
        ("Heavy-Duty Stapler", 16.99, 7, "Active"),
        ("Desk Organizer", 22.00, 38, "Active"),
        ("Whiteboard Markers (8 pack)", 9.75, 140, "Active"),
        ("Paper Shredder", 89.99, 11, "Active"),
        ("Ergonomic Office Chair", 249.00, 6, "Active"),
        ("Printer Paper (500 sheets)", 7.99, 350, "Active"),
        ("Label Maker", 39.50, 0, "Discontinued"),
    ],
    "OUT": [
        ("Two-Person Camping Tent", 149.00, 12, "Active"),
        ("Sleeping Bag", 79.99, 19, "Active"),
        ("Hiking Backpack 40L", 99.00, 4, "Active"),
        ("LED Headlamp", 24.50, 66, "Active"),
        ("Folding Camp Chair", 34.99, 28, "Active"),
        ("Insulated Cooler", 59.99, 10, "Active"),
        ("Trekking Poles", 45.00, 23, "Active"),
        ("Water Filter Bottle", 36.95, 31, "Draft"),
        ("Camping Hammock", 42.00, 14, "Active"),
        ("Fire Starter Kit", 12.49, 88, "Active"),
    ],
    "SPO": [
        ("Yoga Mat", 29.99, 54, "Active"),
        ("Adjustable Dumbbells", 189.00, 9, "Active"),
        ("Speed Jump Rope", 11.99, 130, "Active"),
        ("Resistance Bands Set", 19.99, 77, "Active"),
        ("Road Running Shoes", 119.95, 25, "Active"),
        ("Foam Roller", 24.00, 44, "Active"),
        ("Indoor Basketball", 34.50, 18, "Active"),
        ("Tennis Racket", 89.00, 2, "Active"),
        ("Cycling Helmet", 64.99, 21, "Discontinued"),
        ("Kettlebell 12 kg", 49.00, 16, "Active"),
    ],
    "TOY": [
        ("Building Blocks Set", 39.99, 47, "Active"),
        ("Jigsaw Puzzle (1000 pieces)", 17.99, 62, "Active"),
        ("Remote Control Car", 54.99, 8, "Active"),
        ("Plush Teddy Bear", 19.50, 90, "Active"),
        ("Classic Strategy Board Game", 34.99, 29, "Active"),
        ("Family Card Game", 12.99, 110, "Active"),
        ("Wooden Train Set", 69.00, 13, "Active"),
        ("Art Supplies Kit", 27.99, 35, "Draft"),
        ("Stunt Kite", 24.99, 1, "Active"),
        ("Science Experiment Kit", 44.50, 20, "Active"),
    ],
}

# Recent changes: SKU, days ago, username, name, details. PRODUCTS already holds the new values.
RECENT_UPDATES = [
    ("ELE-1009", 12, "admin1", "Admin One", "Status: Active → Discontinued; Stock: 6 → 0"),
    ("OFF-1010", 9, "admin3", "Admin Three", "Status: Active → Discontinued"),
    ("SPO-1009", 8, "admin1", "Admin One", "Status: Active → Discontinued"),
    ("ELE-1004", 6, "admin3", "Admin Three", "Price: 189.99 → 199.99"),
    ("HOM-1008", 4, "admin2", "Admin Two", "Stock: 15 → 3"),
    ("SPO-1008", 3, "admin2", "Admin Two", "Price: 79.00 → 89.00"),
    ("OUT-1003", 2, "admin2", "Admin Two", "Stock: 12 → 4"),
    ("TOY-1009", 1, "admin3", "Admin Three", "Stock: 9 → 1"),
]

CREATORS = [("admin1", "Admin One"), ("admin2", "Admin Two")]


def _log(
    session: Session,
    at: datetime,
    username: str,
    name: str,
    action: str,
    entity_type: str,
    entity_id: int,
    label: str,
    details: str = "",
) -> None:
    session.add(
        Activity(
            at=at,
            username=username,
            user_display_name=name,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_label=label,
            details=details,
        )
    )


def load_sample_data(session: Session) -> None:
    now = utc_now().replace(microsecond=0)

    categories: dict[str, Category] = {}
    for index, (prefix, name, description) in enumerate(CATEGORIES):
        category = Category(name=name, description=description)
        session.add(category)
        session.flush()
        categories[prefix] = category
        _log(session, now - timedelta(days=120) + timedelta(minutes=5 * index), "admin1", "Admin One", "Created",
             "Category", category.id, name)

    suppliers: list[Supplier] = []
    for index, (name, contact, email, phone, country) in enumerate(SUPPLIERS):
        supplier = Supplier(name=name, contact_name=contact, email=email, phone=phone, country=country)
        session.add(supplier)
        session.flush()
        suppliers.append(supplier)
        _log(session, now - timedelta(days=110) + timedelta(minutes=5 * index), "admin1", "Admin One", "Created",
             "Supplier", supplier.id, name)

    by_sku: dict[str, Product] = {}
    number = 0
    for category_index, (prefix, items) in enumerate(PRODUCTS.items()):
        category = categories[prefix]
        for item_index, (name, price, stock, status) in enumerate(items):
            sku = f"{prefix}-{1001 + item_index}"
            username, display_name = CREATORS[number % len(CREATORS)]
            created = now - timedelta(days=100 - number, hours=item_index)
            supplier = suppliers[(category_index * 3 + item_index) % len(suppliers)]
            product = Product(
                sku=sku,
                name=name,
                description=f"{name}, part of the {category.name} range.",
                category_id=category.id,
                supplier_id=supplier.id,
                price=price,
                stock=stock,
                reorder_level=10,
                status=status,
                created_at=created,
                updated_at=created,
                created_by=display_name,
                updated_by=display_name,
            )
            session.add(product)
            session.flush()
            by_sku[sku] = product
            _log(session, created, username, display_name, "Created", "Product", product.id, f"{sku} {name}")
            number += 1

    for sku, days_ago, username, display_name, details in RECENT_UPDATES:
        product = by_sku[sku]
        at = now - timedelta(days=days_ago, hours=3)
        product.updated_at = at
        product.updated_by = display_name
        session.add(product)
        _log(session, at, username, display_name, "Updated", "Product", product.id, f"{sku} {product.name}", details)
