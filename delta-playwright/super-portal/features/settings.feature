Feature: Settings
  Everyone has settings of their own. A default priority saves choosing one in each new request.

  @regression @SP-010
  Scenario: Settings show who you are
    When a standard user opens their settings
    Then the settings show the standard user's username
    And the settings show the role standard

  @regression @SP-010
  Scenario: Saving a default priority
    When a standard user sets their default priority for new requests to Urgent
    Then the standard user is told the settings were saved

  @regression @SP-010
  Scenario: The default priority is remembered
    Given a standard user has set their default priority for new requests to Urgent
    When the standard user comes back to their settings
    Then the default priority for new requests is still Urgent

  @regression @SP-010
  Scenario: New requests start with the default priority
    Given a standard user has set their default priority for new requests to Urgent
    When the standard user starts a new request
    Then the request's priority starts as Urgent
