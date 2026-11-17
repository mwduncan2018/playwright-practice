Feature: Dashboard

  @smoke @SC-002
  Scenario: SC-002 Dashboard counts and low-stock products
    When the standard user opens the Dashboard
    Then the standard user sees that the browser tab's title is "Dashboard · Super Catalog"
    And the standard user sees that counts are shown for Products, Active products, Low stock, Categories and Suppliers
    And the standard user sees that the Suppliers count is 8
    When the standard user selects "See all low-stock products"
    Then the standard user sees that the Products page opens with "Low stock only" checked
    And the standard user sees that every product listed has a Low badge
