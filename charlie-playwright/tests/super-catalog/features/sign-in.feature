Feature: Sign in

  @smoke @SC-001 @no-trace
  Scenario: SC-001 Sign in and sign out
    When the signed-out user opens Super Catalog
    Then the signed-out user sees that Keycloak's sign-in page opens, with the title "Sign in to Super Apps"
    When the signed-out user enters the username and the wrong password, then selects Sign In
    Then the signed-out user sees that the page says "Invalid username or password."
    When the signed-out user enters the username and the correct password, then selects Sign In
    Then the signed-out user sees that the Dashboard opens and says "Welcome, <name>." with the user's name
    And the signed-out user sees that the user's name is shown at the top right
    When the signed-out user opens the user menu and selects Sign out
    Then the signed-out user sees that Keycloak's sign-in page opens again
