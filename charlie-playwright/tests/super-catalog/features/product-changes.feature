Feature: Product changes

  @smoke @SC-005
  Scenario: SC-005 Create a product
    When the admin user opens the Products page and selects New product
    Then the admin user sees that the New product form opens
    When the admin user fills in the form with the test data and selects Create product
    Then the admin user sees that the message "Created <SKU> <name>." appears
    And the admin user sees that the product's page shows price $19.99, stock 25, status Draft and supplier Granite Works
    And the admin user sees that the product's page says it was created by the signed-in admin
    When the admin user opens the Products page and searches for the SKU
    Then the admin user sees that exactly one product is listed: the new one

  @regression @SC-006
  Scenario: SC-006 Product form validation
    When the admin user opens the New product form and selects Create product without entering anything
    Then the admin user sees that SKU says "Enter a SKU like ABC-1234: three capital letters, a dash and four digits."
    And the admin user sees that Name says "Enter a name."
    And the admin user sees that Category says "Choose a category."
    And the admin user sees that Price (USD) says "Enter a price greater than 0 and no more than 100,000."
    When the admin user enters the duplicate SKU and the other test data, then selects Create product
    Then the admin user sees that SKU says "Another product already uses SKU ELE-1001."
    And the admin user sees that the New product form is still open
    When the admin user enters the bad stock and selects Create product
    Then the admin user sees that Stock says "Enter a whole number, 0 or more."

  @regression @SC-007
  Scenario: SC-007 Edit a product and add an image
    When the admin user creates a product with the test data
    Then the admin user sees that the product's page opens
    When the admin user selects Edit, enters the new price and stock, chooses the image, and selects Save changes
    Then the admin user sees that the message "Saved changes to <SKU> <name>." appears
    And the admin user sees that the product's page shows price $24.50 and stock 3 with a Low stock badge
    And the admin user sees that the product's photo is shown
    When the admin user opens the Activity log and chooses Product in Type
    Then the admin user sees that an Updated entry for the product says "Price: 19.99 → 24.50; Stock: 25 → 3"

  @regression @SC-008
  Scenario: SC-008 Delete a product
    When the admin user creates a product with the test data
    Then the admin user sees that the product's page opens
    When the admin user selects Delete
    Then the admin user sees that a Delete product dialog asks "Delete <SKU> <name>? This can't be undone."
    When the admin user selects Cancel
    Then the admin user sees that the dialog closes, and the product's page is still shown
    When the admin user selects Delete, then selects Delete in the dialog
    Then the admin user sees that the message "Deleted <SKU> <name>." appears
    And the admin user sees that the Products page opens
    When the admin user searches the Products page for the SKU
    Then the admin user sees that the page says "No products match these filters."
