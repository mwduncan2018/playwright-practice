Feature: Approvals

  @smoke @SP-006
  Scenario: SP-006 An admin approves a request
    When the standard user submits the Tableau request in the test data
    Then the standard user sees that the wizard shows the new request's number
    When the admin user opens Approvals
    Then the admin user sees that the request is listed
    When the admin user selects Approve for the request, enters the note, and selects Approve
    Then the admin user sees that the message "Approved <number>." appears
    And the admin user sees that the request is no longer listed
    When the standard user opens the request
    Then the standard user sees that the status is Approved
    And the standard user sees that the page says the admin approved it, with the note
    And the standard user sees that the history ends with Approved

  @regression @SP-007
  Scenario: SP-007 An admin rejects a request
    When the standard user submits the Customer CRM request in the test data
    Then the standard user sees that the wizard shows the new request's number
    When the admin user opens the request and selects Reject
    Then the admin user sees that a Reject dialog opens for the request
    When the admin user selects Reject without entering a reason
    Then the admin user sees that the dialog says "Tell the requester why, in at least 5 characters."
    When the admin user enters the rejection reason and selects Reject
    Then the admin user sees that the message "Rejected <number>." appears
    And the admin user sees that the status is Rejected, and the page shows the reason
    When the standard user opens My requests and chooses Rejected in Status
    Then the standard user sees that the request is listed as Rejected

  @regression @SP-008
  Scenario: SP-008 Admins can't decide on their own requests
    When the admin user submits the headset request in the test data
    Then the admin user sees that the wizard shows the new request's number
    When the admin user opens Approvals
    Then the admin user sees that the request isn't listed
    When the admin user opens the request
    Then the admin user sees that the page says "You can't approve or reject your own request. Another admin will decide on it."
    And the admin user sees that there are no Approve or Reject buttons
