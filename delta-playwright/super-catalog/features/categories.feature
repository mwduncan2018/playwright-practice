Feature: Categories
  Admins sort products into categories.

  Rule: Admins can add and rename categories

    @regression @SC-009
    Scenario: Adding a category
      When an admin adds a category with a new name
      Then the admin is told the category was created
      And the category is listed with 0 products

    @regression @SC-009
    Scenario: Renaming a category
      Given an admin has added a category
      When the admin renames the category
      Then the category is listed under its new name

  Rule: Category names are unique

    @regression @SC-009
    Scenario: A category can't take another category's name
      Given an admin has added a category
      When the admin renames the category to Electronics
      Then the admin is told "A category named Electronics already exists."

  Rule: Only a category with no products can be deleted

    @regression @SC-009
    Scenario: A category with products can't be deleted
      Given the Electronics category has 10 products
      When an admin deletes the Electronics category
      Then the admin is told "Electronics has 10 products, so it can't be deleted. Move or delete them first."

    @regression @SC-009
    Scenario: Deleting an empty category
      Given an admin has added a category with no products
      When the admin deletes the category
      Then the admin is told the category was deleted
      And the category is no longer listed
