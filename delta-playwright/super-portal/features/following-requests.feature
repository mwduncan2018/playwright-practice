Feature: Following a request
  People who make a request can comment on it, and can cancel it while it's waiting for a decision.

  @regression @SP-005
  Scenario: A waiting request can be cancelled
    Given a standard user has a request awaiting approval
    When the standard user views the request
    Then the request's status is Submitted
    And the standard user is offered a way to cancel it

  @regression @SP-005
  Scenario: Commenting on a request
    Given a standard user has a request awaiting approval
    When the standard user comments "Any full-size keyboard is fine." on the request
    Then the standard user is told the comment was posted
    And the request's history lists the comment

  @regression @SP-005
  Scenario: Deciding not to cancel
    Given a standard user has started to cancel a request awaiting approval
    When the standard user decides to keep the request
    Then the request's status is still Submitted

  @regression @SP-005
  Scenario: Cancelling a request
    Given a standard user has a request awaiting approval
    When the standard user cancels the request
    Then the standard user is told the request was cancelled
    And the request's status is Cancelled
    And the request says the standard user cancelled it
    And the request can't be cancelled again
