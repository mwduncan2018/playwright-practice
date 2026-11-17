Feature: Settings

  @regression @SP-010 @side-account
  Scenario: SP-010 Settings set the wizard's default priority
    When the standard side user opens the user menu and selects Settings
    Then the standard side user sees that the Settings page shows the user's username and the role standard
    When the standard side user chooses Urgent in Default priority for new requests and selects Save settings
    Then the standard side user sees that the message "Settings saved." appears
    When the standard side user reloads the page
    Then the standard side user sees that Default priority for new requests still shows Urgent
    When the standard side user opens New request, selects Request access, chooses HR records and Read only, and selects Next
    Then the standard side user sees that the Priority and reason step has Urgent selected
    When the standard side user closes the wizard with its X and selects Discard
    Then the standard side user sees that the wizard closes
    When the standard side user opens Settings, chooses Normal in Default priority for new requests, and selects Save settings
    Then the standard side user sees that the message "Settings saved." appears
