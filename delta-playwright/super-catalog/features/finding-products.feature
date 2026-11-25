Feature: Finding products
  Anyone signed in can search and filter the product list. The sample catalog has 60 products in 6 categories.

  Rule: Search matches product names

    @regression @SC-003
    Scenario: Searching by name
      When a standard user searches the products for "lamp"
      Then only LED Desk Lamp and LED Headlamp are listed

    @regression @SC-003
    Scenario: A search can be shared by its address
      When a standard user searches the products for "lamp"
      Then the page address includes "search=lamp"

  Rule: Filters narrow the list, and they combine

    @regression @SC-004
    Scenario: Filtering by category
      When a standard user filters the products to the Electronics category
      Then 10 products are listed

    @regression @SC-003
    Scenario: Filtering by category and status
      When a standard user filters the products to the active products in Toys & Games
      Then 9 products are listed

    @regression @SC-003
    Scenario: Showing only low-stock products
      Given a standard user is viewing the active products in Toys & Games
      When the standard user limits the list to low-stock products
      Then only Remote Control Car and Stunt Kite are listed

    @regression @SC-003
    Scenario: Setting a minimum price
      Given a standard user is viewing the active, low-stock products in Toys & Games
      When the standard user sets a minimum price of $30
      Then only Remote Control Car is listed

    @regression @SC-003
    Scenario: Clearing the filters
      Given a standard user has searched the products for "lamp"
      When the standard user clears the filters
      Then the search is empty
