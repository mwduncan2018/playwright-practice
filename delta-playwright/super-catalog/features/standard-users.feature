Feature: What standard users can do
  Standard users can see everything in the catalog, but they can't change anything.

  @smoke @SC-010
  Scenario: Standard users can't add products
    When a standard user views the products
    Then the standard user isn't offered a way to add a product

  @smoke @SC-010
  Scenario: Standard users can't change or delete a product
    When a standard user opens the product Adjustable Dumbbells
    Then the standard user sees the product, with SKU SPO-1002
    And the standard user isn't offered a way to edit or delete it

  @smoke @SC-010
  Scenario: Standard users are turned away from the New product form
    When a standard user goes straight to the address /products/new
    Then the standard user is told "You don't have access to this page"

  @smoke @SC-010
  Scenario: Standard users don't see the activity log
    When a standard user opens Super Catalog
    Then the menu doesn't offer the activity log
