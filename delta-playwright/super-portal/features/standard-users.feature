Feature: What standard users can do
  Standard users make and follow their own requests. Only admins see everyone's requests.

  @regression @SP-014
  Scenario: Standard users aren't offered All requests
    When a standard user opens Super Portal
    Then the menu doesn't offer All requests

  @regression @SP-014
  Scenario: Standard users are turned away from All requests
    When a standard user goes straight to the address /all-requests
    Then the standard user is told "You don't have access to this page"
