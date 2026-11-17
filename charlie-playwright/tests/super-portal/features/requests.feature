Feature: Requests

  @regression @SP-005
  Scenario: SP-005 Comment on and cancel your request
    When the standard user submits the keyboard request in the test data
    Then the standard user sees that the wizard shows the new request's number
    When the standard user selects View request
    Then the standard user sees that the request's page shows the status Submitted and a Cancel request button
    When the standard user enters the comment and selects Post comment
    Then the standard user sees that the message "Comment posted." appears
    And the standard user sees that the history lists the comment
    When the standard user selects Cancel request, then selects Keep request
    Then the standard user sees that the dialog closes and the status is still Submitted
    When the standard user selects Cancel request, then selects Cancel request in the dialog
    Then the standard user sees that the message "Cancelled <number>." appears
    And the standard user sees that the status is Cancelled, and the page says the user cancelled it
    And the standard user sees that there's no Cancel request button
