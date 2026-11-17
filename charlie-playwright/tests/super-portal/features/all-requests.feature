Feature: All requests

  @regression @SP-011
  Scenario: SP-011 Choose and order the All requests columns
    When the admin user opens All requests
    Then the admin user sees that the table's columns are Number, Title, Type, Requester, Priority, Status and Submitted, in that order
    When the admin user selects Columns
    Then the admin user sees that the Choose columns dialog opens
    And the admin user sees that Number is checked and can't be unchecked
    And the admin user sees that Needed by, Updated and Decided by aren't checked
    When the admin user checks Decided by, unchecks Type, selects the up arrow (↑) for Decided by three times, and selects Save columns
    Then the admin user sees that the dialog closes
    And the admin user sees that the table's columns are Number, Title, Requester, Priority, Status, Decided by and Submitted, in that order
    When the admin user reloads the page
    Then the admin user sees that the table's columns are still Number, Title, Requester, Priority, Status, Decided by and Submitted
    When the admin user selects Columns, unchecks Decided by, and selects Cancel
    Then the admin user sees that the dialog closes
    And the admin user sees that Decided by is still shown
    When the admin user selects Columns, selects Reset to default, and selects Save columns
    Then the admin user sees that the table's columns are Number, Title, Type, Requester, Priority, Status and Submitted again

  @regression @SP-012
  Scenario: SP-012 Find a request on All requests and check who decided it
    When the standard user submits the webcam request in the test data
    Then the standard user sees that the wizard shows the new request's number
    When the admin user opens All requests, selects Columns, checks Decided by, selects the down arrow (↓) for Requester twice, and selects Save columns
    Then the admin user sees that the table's columns are Number, Title, Type, Priority, Status, Requester, Submitted and Decided by, in that order
    When the admin user searches for the request's number
    Then the admin user sees that the request is listed, with the standard user as its requester
    And the admin user sees that its Status is Submitted, and Decided by shows "—"
    When the admin user opens the request, selects Approve, and selects Approve in the dialog
    Then the admin user sees that the message "Approved <number>." appears
    And the admin user sees that the status is Approved
    When the admin user opens All requests and searches for the request's number
    Then the admin user sees that its Status is Approved, and Decided by shows the admin's name

  @regression @SP-013
  Scenario: SP-013 Filter and page through All requests
    When the admin user opens All requests and chooses Standard Four in Requester
    Then the admin user sees that the page says "Showing 1–10 of 13 requests"
    When the admin user selects the next-page arrow (›)
    Then the admin user sees that the page says "Showing 11–13 of 13 requests"
    And the admin user sees that page 2 is marked as the current page
    When the admin user chooses Submitted in Status
    Then the admin user sees that the page says "Showing 1–1 of 1 request"
    And the admin user sees that the only request listed is REQ-1098, Customer CRM: Read only
    When the admin user selects Clear filters
    Then the admin user sees that Requester shows Everyone and Status shows All statuses
    And the admin user sees that the page says "Showing 1–10 of" and the total

  @regression @SP-014
  Scenario: SP-014 Standard users can't open All requests
    When the standard user opens Home and looks at the menu at the top of the page
    Then the standard user sees that there's no All requests link
    When the standard user goes to the address /all-requests
    Then the standard user sees that the page says "You don't have access to this page"
