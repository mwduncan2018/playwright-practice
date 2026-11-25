Feature: Deciding on requests
  Admins approve or reject the requests that other people submit. The requester sees the decision.

  Rule: Admins approve requests

    @smoke @SP-006
    Scenario: A waiting request is listed for approval
      Given a standard user has a request awaiting approval
      When an admin views the approvals
      Then the request is listed

    @smoke @SP-006
    Scenario: Approving a request
      Given a standard user has a request awaiting approval
      When an admin approves the request with the note "Approved for this quarter."
      Then the admin is told the request was approved
      And the request is no longer listed for approval

    @smoke @SP-006
    Scenario: The requester sees the approval
      Given an admin has approved a standard user's request with the note "Approved for this quarter."
      When the standard user views the request
      Then the request's status is Approved
      And the request says the admin approved it, with the note
      And the request's history ends with Approved

    @regression @SP-012
    Scenario: Approving a request from its own page
      Given a standard user has a request awaiting approval
      When an admin approves the request from the request's page
      Then the admin is told the request was approved
      And the request's status is Approved

  Rule: Admins reject requests, and say why

    @regression @SP-007
    Scenario: Rejecting a request needs a reason
      Given a standard user has a request awaiting approval
      When an admin tries to reject the request without giving a reason
      Then the admin is told "Tell the requester why, in at least 5 characters."

    @regression @SP-007
    Scenario: Rejecting a request
      Given a standard user has a request awaiting approval
      When an admin rejects the request with the reason "Ask your team lead to request access for the whole team."
      Then the admin is told the request was rejected
      And the request's status is Rejected
      And the request shows the reason

    @regression @SP-007
    Scenario: The requester finds the rejected request
      Given an admin has rejected a standard user's request
      When the standard user looks at their rejected requests
      Then the request is listed as Rejected

  Rule: Admins can't decide on their own requests

    @regression @SP-008
    Scenario: An admin's own request isn't listed for approval
      Given an admin has a request awaiting approval
      When the admin views the approvals
      Then the admin's own request isn't listed

    @regression @SP-008
    Scenario: An admin can't decide on their own request
      Given an admin has a request awaiting approval
      When the admin views the request
      Then the admin is told "You can't approve or reject your own request. Another admin will decide on it."
      And the admin isn't offered a way to approve or reject it
