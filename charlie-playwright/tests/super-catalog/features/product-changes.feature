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
