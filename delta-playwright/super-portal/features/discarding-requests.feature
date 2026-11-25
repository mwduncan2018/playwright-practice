Feature: Discarding an unfinished request
  Someone who has started a request can abandon it. They're asked first, so answers aren't lost by accident.

  @regression @SP-004
  Scenario: Cancelling asks before discarding
    Given a standard user has started an equipment request for a laptop
    When the standard user cancels the unfinished request
    Then the standard user is asked "Discard this request?"
    And the standard user can keep editing or discard it

  @regression @SP-004
  Scenario: Keeping editing keeps the answers
    Given a standard user has been asked whether to discard an equipment request for a laptop
    When the standard user chooses to keep editing
    Then the request still has Laptop chosen

  @regression @SP-004
  Scenario: Discarding closes the request
    Given a standard user has started an equipment request for a laptop
    When the standard user discards the request
    Then the request is closed

  @regression @SP-004
  Scenario: A discarded request leaves nothing behind
    Given a standard user has discarded an equipment request for a laptop
    When the standard user starts another equipment request
    Then the new request starts from the beginning, with no item chosen
