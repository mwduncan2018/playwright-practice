Feature: Requesting administrator access
  Administrator access to a system is a risk, so asking for it adds a security review to the request.

  @regression @SP-003
  Scenario: Asking for administrator access adds a security review
    Given a standard user has started an access request, which has 3 steps
    When the standard user asks for Administrator access to the Production database
    Then the request has 4 steps
    And one of the steps is a Security review

  @regression @SP-003
  Scenario: The security review can't be skipped
    Given a standard user is requesting Administrator access to the Production database
    When the standard user tries to continue without filling in the security review
    Then the standard user is told what the security review needs:
      | Reason   | Explain in at least 20 characters why you need administrator access. |
      | Training | Confirm that you've completed security training.                     |

  @regression @SP-003
  Scenario: The request records the security review
    Given a standard user has submitted a request for Administrator access, with the security review completed
    When the standard user views the request
    Then the request shows the access level Administrator
    And the request shows security training as Completed
