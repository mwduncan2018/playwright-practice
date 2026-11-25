Feature: Product list
  Anyone signed in can sort the product list, page through it and export it as a CSV file.

  Rule: The list can be sorted by price

    @regression @SC-004
    Scenario Outline: Sorting by price, <order> first
      Given a standard user is viewing the products in Electronics
      When the standard user sorts them by price, <order> first
      Then the first product is <product> at <price>

      Examples:
        | order   | product              | price   |
        | highest | 27-inch Monitor      | $279.00 |
        | lowest  | USB-C Charging Cable | $12.99  |

  Rule: Long lists are split into pages

    @regression @SC-004
    Scenario: Going to the next page
      Given a standard user is viewing all the products, 25 to a page
      When the standard user goes to the next page
      Then products 26 to 50 are shown
      And page 2 is marked as the current page

  Rule: The list can be exported

    @regression @SC-004
    Scenario: Exporting the products in a category
      Given a standard user is viewing the products in Electronics
      When the standard user exports the list
      Then a file named products-YYYY-MM-DD.csv, for today's date, is downloaded
      And the file has a heading row and a row for each of the 10 products
