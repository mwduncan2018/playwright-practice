Feature: Products

  @regression @SC-003
  Scenario: SC-003 Search and filter products
    When the standard user opens the Products page and enters "lamp" in Search
    Then the standard user sees that exactly two products are listed: LED Desk Lamp and LED Headlamp
    And the standard user sees that the address includes search=lamp
    When the standard user selects Clear filters
    Then the standard user sees that Search is empty again
    When the standard user chooses Toys & Games in Category and Active in Status
    Then the standard user sees that the page says "Showing 1–9 of 9 products"
    When the standard user checks "Low stock only"
    Then the standard user sees that exactly two products are listed: Remote Control Car and Stunt Kite
    When the standard user enters 30 in Min price
    Then the standard user sees that only Remote Control Car is listed

  @regression @SC-004
  Scenario: SC-004 Sort, page through and export products
    When the standard user opens the Products page and chooses Electronics in Category
    Then the standard user sees that the page says "Showing 1–10 of 10 products"
    When the standard user selects the Price column heading twice
    Then the standard user sees that the Price column is sorted from highest to lowest
    And the standard user sees that the first product is 27-inch Monitor at $279.00
    When the standard user selects the Price column heading again
    Then the standard user sees that the first product is USB-C Charging Cable at $12.99
    When the standard user selects Export CSV
    Then the standard user sees that a file named products-<today's date>.csv downloads
    And the standard user sees that the file has a heading row and 10 product rows
    When the standard user selects Clear filters, chooses 25 in Rows per page, then selects the next-page arrow (›)
    Then the standard user sees that the page says "Showing 26–50 of" and the total
    And the standard user sees that page 2 is marked as the current page
