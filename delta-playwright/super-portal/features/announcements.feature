Feature: Announcements
  Admins write announcements for everyone or for one group of people, and can schedule them for a later date.

  @regression @SP-009
  Scenario: An announcement needs a title and a message
    When an admin tries to continue a new announcement without entering anything
    Then the admin is told what the announcement needs:
      | Title   | Enter a title.     |
      | Message | Enter the message. |

  @regression @SP-009
  Scenario: The review shows the audience and the date
    Given an admin has written an announcement for standard users only, to publish three days from today
    When the admin reviews the announcement
    Then the review shows the audience "Standard users only"
    And the review shows the publish date, at 09:00 UTC

  @regression @SP-009
  Scenario: Scheduling an announcement
    Given an admin has written an announcement for standard users only, to publish three days from today
    When the admin schedules the announcement
    Then the announcement says it's scheduled
    And the announcement's audience is "Standard users only"

  @regression @SP-009
  Scenario: A scheduled announcement isn't shown before its date
    Given an admin has scheduled an announcement for standard users only, to publish three days from today
    When a standard user views the announcements
    Then the announcement isn't listed

  @regression @SP-009
  Scenario: Deleting an announcement
    Given an admin has scheduled an announcement
    When the admin deletes the announcement
    Then the admin is told the announcement was deleted
