Feature: Sign in
  People sign in to Super Catalog through the shared Super Apps sign-in page.

  @smoke @SC-001
  Scenario: Visitors are asked to sign in
    When a signed-out visitor opens Super Catalog
    Then the visitor is asked to sign in to Super Apps

  @smoke @SC-001
  Scenario: A wrong password is refused
    When a standard user signs in with the wrong password
    Then the standard user is told "Invalid username or password."

  @smoke @SC-001
  Scenario: Signing in opens the Dashboard
    When a standard user signs in with the correct password
    Then the standard user sees the Dashboard, welcoming them by name
    And the standard user's name is shown as the signed-in user

  @smoke @SC-001
  Scenario: Signing out
    Given a standard user is signed in
    When the standard user signs out
    Then the standard user is asked to sign in again
