Feature: Categories

  @regression @SC-009
  Scenario: SC-009 Add, rename and delete a category
    When the admin user opens Categories and selects New category
    Then the admin user sees that the New category dialog opens
    When the admin user enters the name and selects Save
    Then the admin user sees that the message "Created the <name> category." appears
    And the admin user sees that the category is listed with 0 products
    When the admin user selects Edit for the category, enters the existing name, and selects Save
    Then the admin user sees that the dialog says "A category named Electronics already exists."
    When the admin user enters the new name and selects Save
    Then the admin user sees that the category is listed under its new name
    When the admin user selects Delete for Electronics, then selects Delete in the dialog
    Then the admin user sees that the dialog says "Electronics has 10 products, so it can't be deleted. Move or delete them first."
    When the admin user selects OK, then selects Delete for the renamed category and Delete in the dialog
    Then the admin user sees that the message "Deleted the <new name> category." appears
    And the admin user sees that the category is no longer listed
