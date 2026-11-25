Feature: Dashboard
  The Dashboard sums up the catalog and points to the products that need attention.

  @smoke @SC-002
  Scenario: The Dashboard counts the catalog
    When a standard user opens the Dashboard
    Then the Dashboard shows counts of products, active products, low-stock products, categories and suppliers
    And the supplier count is 8

  @smoke @SC-002
  Scenario: The Dashboard leads to the low-stock products
    When a standard user follows the Dashboard's link to low-stock products
    Then the product list is filtered to low-stock products
    And every product listed is marked Low
