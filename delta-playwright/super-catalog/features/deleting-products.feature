Feature: Deleting products
  Admins delete products the catalog no longer needs. Deleting can't be undone, so the admin confirms it first.

  @regression @SC-008
  Scenario: Deleting a product asks for confirmation
    Given an admin has added a product
    When the admin starts to delete the product
    Then the admin is asked to confirm deleting the product, named by its SKU and name
    And the admin is warned that it can't be undone

  @regression @SC-008
  Scenario: Cancelling keeps the product
    Given an admin is asked to confirm deleting a product
    When the admin cancels
    Then the product's page is still shown

  @regression @SC-008
  Scenario: Deleting a product removes it from the catalog
    Given an admin has added a product
    When the admin deletes the product
    Then the admin is told the product was deleted
    And the product is no longer in the catalog
