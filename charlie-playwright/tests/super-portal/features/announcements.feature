Feature: Announcements

  @regression @SP-009
  Scenario: SP-009 Schedule an announcement for standard users
    When the admin user opens Announcements and selects New announcement
    Then the admin user sees that the New announcement wizard opens at "Step 1 of 4"
    When the admin user selects Next without entering anything
    Then the admin user sees that Title says "Enter a title."
    And the admin user sees that Message says "Enter the message."
    When the admin user enters the title and message and selects Next, chooses the audience and selects Next, then chooses Schedule for a later date, enters the date, checks the pin box, and selects Next
    Then the admin user sees that the Review step shows "Standard users only" and the date at 09:00 UTC
    When the admin user selects Schedule announcement, then selects View announcement
    Then the admin user sees that the announcement's page says it's scheduled
    And the admin user sees that the audience is "Standard users only"
    When the standard user opens Announcements
    Then the standard user sees that the announcement isn't listed
    When the admin user deletes the announcement
    Then the admin user sees that the message "Deleted the announcement." appears
