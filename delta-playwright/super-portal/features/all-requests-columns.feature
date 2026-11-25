Feature: Choosing the All requests columns
  Admins choose which columns the All requests table shows, and in what order.

  Rule: The table starts with its default columns

    @regression @SP-011
    Scenario: The default columns
      When an admin views all requests
      Then the table's columns are Number, Title, Type, Requester, Priority, Status and Submitted, in that order

    @regression @SP-011
    Scenario: Number can't be removed
      When an admin starts to choose columns
      Then Number is chosen and can't be removed

    @regression @SP-011
    Scenario: Three columns start hidden
      When an admin starts to choose columns
      Then Needed by, Updated and Decided by aren't chosen

  Rule: Admins choose and order the columns

    @regression @SP-011
    Scenario: Choosing and ordering columns
      When an admin chooses these columns for all requests, in this order:
        | Number | Title | Requester | Priority | Status | Decided by | Submitted |
      Then the table shows exactly those columns, in that order

    @regression @SP-011
    Scenario: The chosen columns are remembered
      Given an admin has chosen their own columns for all requests
      When the admin comes back to all requests
      Then the table still shows the columns the admin chose

    @regression @SP-011
    Scenario: Cancelling keeps the columns
      Given an admin is showing the Decided by column in all requests
      When the admin cancels a change that would remove Decided by
      Then Decided by is still shown

    @regression @SP-011
    Scenario: Resetting to the default columns
      Given an admin has chosen their own columns for all requests
      When the admin resets the columns to the default
      Then the table's columns are Number, Title, Type, Requester, Priority, Status and Submitted, in that order
