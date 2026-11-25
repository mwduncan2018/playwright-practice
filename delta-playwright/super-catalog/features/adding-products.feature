Feature: Adding products
  Admins add products to the catalog. Every product needs a SKU, a name, a category and a price.

  Rule: Admins can add products

    @smoke @SC-005
    Scenario: Adding a product
      When an admin adds a product with a new SKU and these details:
        | Category | Home & Kitchen |
        | Supplier | Granite Works  |
        | Price    | 19.99          |
        | Stock    | 25             |
        | Status   | Draft          |
      Then the admin is told the product was created
      And the product's page shows a price of $19.99, stock of 25, status Draft and supplier Granite Works
      And the product's page says the admin created it

    @smoke @SC-005
    Scenario: A new product can be found by its SKU
      Given an admin has added a product with a new SKU
      When the admin searches the products for that SKU
      Then only the new product is listed

  Rule: The product form checks what's entered

    @regression @SC-006
    Scenario: SKU, name, category and price are required
      When an admin tries to add a product without entering anything
      Then the admin is told what each required field needs:
        | SKU         | Enter a SKU like ABC-1234: three capital letters, a dash and four digits. |
        | Name        | Enter a name.                                                             |
        | Category    | Choose a category.                                                        |
        | Price (USD) | Enter a price greater than 0 and no more than 100,000.                    |

    @regression @SC-006
    Scenario: A SKU can't be used twice
      Given USB-C Charging Cable has the SKU ELE-1001
      When an admin adds a product with the SKU ELE-1001
      Then the product isn't created
      And the admin is told "Another product already uses SKU ELE-1001."

    @regression @SC-006
    Scenario: Stock can't be negative
      When an admin adds a product with a stock of -1
      Then the admin is told the stock must be "a whole number, 0 or more"
