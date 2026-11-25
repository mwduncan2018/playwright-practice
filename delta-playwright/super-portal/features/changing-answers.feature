Feature: Changing answers before submitting
  While filling in a request, people can go back and change what they've answered.

  @regression @SP-002
  Scenario: Going back keeps the answers
    Given a standard user has chosen a 1 year license with 3 seats in a software request, and moved on
    When the standard user goes back
    Then the license still shows 1 year and 3 seats

  @regression @SP-002
  Scenario: The review shows a software request's answers
    Given a standard user has filled in a software request for Figma, for 1 year with 3 seats
    When the standard user reviews the request
    Then the review shows Figma, 1 year and 3 seats

  @regression @SP-002
  Scenario: Changing an answer from the review
    Given a standard user is reviewing a software request for Figma
    When the standard user changes the software to Miro
    Then the review shows Miro

  @regression @SP-002
  Scenario: The submitted request has the changed answer
    Given a standard user has submitted a software request after changing it from Figma to Miro, for 1 year with 3 seats
    When the standard user views the request
    Then the request is titled with its number and "Miro (1 year)"
    And the request shows 3 seats
