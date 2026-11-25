Feature: Requesting equipment
  Standard users ask for equipment, such as a monitor, and choose how they want to get it.

  Rule: A request can't go on without what it needs

    @smoke @SP-001
    Scenario: An equipment request needs an item
      When a standard user tries to continue an equipment request without choosing an item
      Then the standard user is told "Choose an item."
      And the request stays on its first step

    @smoke @SP-001
    Scenario: Shipping to an address needs the address
      Given a standard user is requesting 2 monitors
      When the standard user asks for them to be shipped to an address, without giving one
      Then the standard user is told "Enter the full delivery address."

  Rule: A request is reviewed before it's submitted

    @smoke @SP-001
    Scenario: The review shows every answer
      Given a standard user has filled in an equipment request with:
        | Item     | Monitor                                             |
        | Quantity | 2                                                   |
        | Delivery | Ship to an address                                  |
        | Address  | 500 Market Street, Seattle, WA 98101                |
        | Priority | High                                                |
        | Reason   | Two monitors for my new desk in the Seattle office. |
      When the standard user reviews the request
      Then the review shows the item, quantity, delivery, address, priority and reason

  Rule: A submitted request gets a number and a page of its own

    @smoke @SP-001
    Scenario: Submitting a request gives it a number
      Given a standard user has filled in an equipment request
      When the standard user submits the request
      Then the standard user is told the request was submitted
      And the standard user is given the new request's number

    @smoke @SP-001
    Scenario: A submitted request has a page of its own
      Given a standard user has submitted a request for 2 monitors, shipped to an address
      When the standard user views the request
      Then the request is titled with its number and "Monitor × 2"
      And the request's status is Submitted
      And the request shows the delivery address
