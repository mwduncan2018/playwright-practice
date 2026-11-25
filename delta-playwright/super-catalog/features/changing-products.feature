Feature: Changing products
  Admins change a product's details and photo. Every change is recorded in the activity log.

  @regression @SC-007
  Scenario: Changing a product's price and stock
    Given an admin has added a product with a price of $19.99 and stock of 25
    When the admin saves a new price of $24.50 and stock of 3
    Then the admin is told the changes were saved
    And the product's page shows a price of $24.50 and stock of 3, marked Low stock

  @regression @SC-007
  Scenario: Adding a photo to a product
    Given an admin has added a product
    When the admin adds a photo to the product
    Then the product's photo is shown

  @regression @SC-007
  Scenario: Changes are recorded in the activity log
    Given an admin has changed a product's price from $19.99 to $24.50 and its stock from 25 to 3
    When the admin looks at the product changes in the activity log
    Then an Updated entry for the product says "Price: 19.99 → 24.50; Stock: 25 → 3"
