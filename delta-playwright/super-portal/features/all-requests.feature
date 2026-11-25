Feature: All requests
  Admins see everyone's requests in one table, and can search, filter and page through it.

  Rule: A request can be found by its number

    @regression @SP-012
    Scenario: Finding a waiting request
      Given a standard user has a request awaiting approval
      When an admin searches all requests for the request's number
      Then the request is listed, with the standard user as its requester
      And the request's status is Submitted

  Rule: The table can show who decided each request

    @regression @SP-012
    Scenario: Nobody has decided a waiting request
      Given a standard user has a request awaiting approval
      And an admin is showing the Decided by column in all requests
      When the admin searches all requests for the request's number
      Then the request shows nobody under Decided by

    @regression @SP-012
    Scenario: An approved request shows who approved it
      Given an admin has approved a standard user's request
      And the admin is showing the Decided by column in all requests
      When the admin searches all requests for the request's number
      Then the request's status is Approved
      And the request shows the admin's name under Decided by

  Rule: Filters narrow the table, and they combine

    @regression @SP-013
    Scenario: Filtering by requester
      Given Standard Four has 13 requests
      When an admin filters all requests to Standard Four's
      Then the first 10 of the 13 requests are shown

    @regression @SP-013
    Scenario: Filtering by requester and status
      Given an admin is viewing Standard Four's requests
      When the admin also filters them to Submitted requests
      Then only REQ-1098, Customer CRM: Read only, is listed

    @regression @SP-013
    Scenario: Clearing the filters
      Given an admin has filtered all requests by requester and status
      When the admin clears the filters
      Then the requester filter shows Everyone
      And the status filter shows All statuses
      And the first 10 of all the requests are shown

  Rule: Long lists are split into pages

    @regression @SP-013
    Scenario: Going to the next page
      Given an admin is viewing Standard Four's 13 requests, 10 to a page
      When the admin goes to the next page
      Then requests 11 to 13 are shown
      And page 2 is marked as the current page
