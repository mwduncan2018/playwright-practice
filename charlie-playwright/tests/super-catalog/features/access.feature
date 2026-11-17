Feature: Access

  @smoke @SC-010
  Scenario: SC-010 Standard users can view but not change
    When the standard user opens the Products page
    Then the standard user sees that there's no New product button
    When the standard user opens Adjustable Dumbbells
    Then the standard user sees that the product's page shows SKU SPO-1002
    And the standard user sees that there are no Edit or Delete buttons
    When the standard user goes to the address /products/new
    Then the standard user sees that the page says "You don't have access to this page"
    When the standard user looks at the menu at the top of the page
    Then the standard user sees that there's no Activity log link
