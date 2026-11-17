Feature: Request wizards

  @smoke @SP-001
  Scenario: SP-001 Request equipment shipped to an address
    When the standard user opens New request and selects Request equipment
    Then the standard user sees that the Request equipment wizard opens at "Step 1 of 4"
    When the standard user selects Next without choosing anything
    Then the standard user sees that Item says "Choose an item."
    And the standard user sees that the wizard stays at "Step 1 of 4"
    When the standard user chooses the item and quantity, then selects Next
    Then the standard user sees that the Delivery step opens at "Step 2 of 4"
    When the standard user chooses Ship to an address and selects Next without entering an address
    Then the standard user sees that Delivery address says "Enter the full delivery address."
    When the standard user enters the address and selects Next
    Then the standard user sees that the Priority and reason step opens at "Step 3 of 4"
    When the standard user chooses the priority, enters the reason, and selects Next
    Then the standard user sees that the Review step shows the item, quantity, delivery, address, priority and reason
    When the standard user selects Submit request
    Then the standard user sees that the wizard says "Request submitted" and shows the new request's number
    When the standard user selects View request
    Then the standard user sees that the request's page is titled with its number and "Monitor × 2"
    And the standard user sees that the status is Submitted
    And the standard user sees that the page shows the delivery address

  @regression @SP-002
  Scenario: SP-002 Change answers with Back and Edit
    When the standard user opens New request and selects Request software
    Then the standard user sees that the Request software wizard opens at "Step 1 of 4"
    When the standard user chooses Figma and selects Next, then chooses 1 year and 3 seats and selects Next
    Then the standard user sees that the Priority and reason step opens at "Step 3 of 4"
    When the standard user selects Back
    Then the standard user sees that the License step still shows 1 year and 3 seats
    When the standard user selects Next, enters the reason, and selects Next
    Then the standard user sees that the Review step shows Figma, 1 year and 3 seats
    When the standard user selects Edit for Software, chooses Miro, and selects Next until the Review step
    Then the standard user sees that the Review step shows Miro
    When the standard user selects Submit request
    Then the standard user sees that the wizard shows the new request's number
    When the standard user selects View request
    Then the standard user sees that the request's page is titled with its number and "Miro (1 year)"
    And the standard user sees that the page shows 3 seats

  @regression @SP-003
  Scenario: SP-003 Administrator access adds a security review
    When the standard user opens New request and selects Request access
    Then the standard user sees that the Request access wizard opens at "Step 1 of 3"
    When the standard user chooses the system and the access level
    Then the standard user sees that the wizard now says "Step 1 of 4"
    And the standard user sees that a Security review step is added to the list of steps
    When the standard user selects Next, then selects Next again without filling in the security review
    Then the standard user sees that the reason field says "Explain in at least 20 characters why you need administrator access."
    And the standard user sees that the training box says "Confirm that you've completed security training."
    When the standard user enters the security reason, checks the security training box, and selects Next
    Then the standard user sees that the Priority and reason step opens at "Step 3 of 4"
    When the standard user enters the reason, selects Next, then selects Submit request
    Then the standard user sees that the wizard says "Request submitted"
    When the standard user selects View request
    Then the standard user sees that the request shows access level Administrator
    And the standard user sees that the request shows security training as Completed

  @regression @SP-004
  Scenario: SP-004 Discard an unfinished request
    When the standard user opens New request, selects Request equipment, and chooses Laptop in Item
    Then the standard user sees that Item shows Laptop
    When the standard user selects Cancel
    Then the standard user sees that the wizard asks "Discard this request?" and offers Keep editing and Discard
    When the standard user selects Keep editing
    Then the standard user sees that the Equipment step is back, with Laptop still chosen
    When the standard user closes the wizard with its X, then selects Discard
    Then the standard user sees that the wizard closes
    When the standard user selects Request equipment again
    Then the standard user sees that the wizard starts again at "Step 1 of 4" with no item chosen
