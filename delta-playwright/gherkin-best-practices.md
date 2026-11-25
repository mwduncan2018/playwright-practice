# Gherkin Best Practices

###### Reduce Maintenance + Improve Readability + Improve Reusability + Increase Collaboration

## Gherkin Is Not a Manual Test Plan

- Gherkin scenarios are business specifications. Each one describes a behavior of the system, with an example.
- A manual test plan is a procedure: every action, in order. Gherkin is not a manual test plan.
- One test plan case can become several scenarios, one for each behavior it checks. Tag each scenario with the case
  or requirement ID, such as `@SP-006`, so it still traces back.

## Good Advice

- You should not need to spend a lot of time reading and understanding a scenario.
- A person who works in the business should not feel overwhelmed when reading a scenario.
- Gherkin changes only when the requirement changes. When the implementation changes, the step definitions and page
  objects change, and the scenario stays the same.
- Write scenarios with the business, before the code, so the examples are ones the business agrees with.

## Given, When and Then

- **Given** is the starting state, written as facts that are already true: `Given a software request awaiting approval`.
- **When** is the one action or event the scenario is about.
- **Then** is the outcome someone can observe.
- A scenario has one When. And and But continue the step before them.
- Describe the starting state, not the steps that create it. The step definitions set it up, through the API where
  they can, which is faster than through the screens.

Not this:

```gherkin
Scenario: Approve a request
  Given the standard user opens New request
  And the standard user chooses Figma and 1 seat
  And the standard user submits the request
  And the admin opens Approvals
  When the admin selects Approve for the request
  Then the request is no longer listed
  And the standard user sees the status Approved
```

This:

```gherkin
Scenario: The requester sees an approved request as Approved
  Given a standard user has a software request awaiting approval
  When an admin approves the request
  Then the standard user sees the request as Approved
```

## Who Acts

- Say who acts in every step, the same way in every feature. A role, such as "the admin" or "a standard user", reads
  well and keeps scenarios with several users clear.
- Don't mix "I" with roles.

## Incidental Details

- Avoid navigation details in the Gherkin. Moving between pages is the step definitions' job.
- If you do name a page, name the page where the requirement starts.
- Say what the person does, not which button they click: `When the admin approves the request`, not
  `When the admin clicks Approve`. The exception is when the label itself is the requirement, such as wording that
  legal has approved.
- Don't add Then steps that only confirm you got somewhere on the way. Check navigation only when where the user ends
  up is the requirement, such as the page a user sees after signing in.
- Keep the data that makes the example meaningful, and leave out the rest. In a scenario about free shipping over
  $100, the order total of $95 belongs; the customer's address doesn't.

Not this:

```gherkin
When the admin clicks Products in the menu
And the admin clicks New product
And the admin types ELE-1001 in SKU
And the admin types Desk Lamp in Name
And the admin clicks Create product
Then the admin sees "Another product already uses SKU ELE-1001."
```

This:

```gherkin
When an admin adds a product with a SKU another product already uses
Then the product isn't saved
And the admin is told the SKU is taken
```

## Trying To Do Too Many Things

- A scenario has a single intention: one starting point, one When, and one group of Then steps that verify it.
- Don't verify several unrelated things in one scenario.
- When a scenario does too many things and fails, it's hard to tell which behavior broke, and every check after the
  failure doesn't run.
- Scenarios are independent. None relies on another scenario's data or on the order they run in, so they can run in
  parallel.

## Length

- 3 to 5 steps is ideal, counting And and But lines.
- 5 to 8 steps is okay for complex scenarios.
- Avoid scenarios longer than 8 steps unless that many steps are needed to capture the requirement.
- A long scenario is often several scenarios. Break it up.
- Keep a Background short, and use it only for starting state that every scenario in the feature shares. A reader
  shouldn't have to scroll up to understand a scenario.

## Conjunction Steps

- Don't hide several steps in one step. `When the admin approves the request and the requester cancels it` is two
  steps.
- Every class does one thing well. So does every method, every scenario and every step.
- Reuse comes from steps that state one business action or fact, not from tiny UI steps.
  `When an admin approves the request` is reused wherever approval happens. `When the admin clicks Approve` brings
  clicks into the Gherkin.

## Scenario Outlines

- Use a Scenario Outline for variations of one business rule. Each row of Examples is a case that matters.
- Keep Examples tables small, with only the columns that change the outcome.

```gherkin
Scenario Outline: Free shipping starts at $100
  Given an order totaling <total>
  When the customer checks out
  Then shipping costs <shipping>

  Examples:
    | total   | shipping |
    | $99.99  | $5.00    |
    | $100.00 | free     |
```

## Names

- Name a scenario after the behavior it shows, briefly: "Free shipping starts at $100", not "Checkout test 3".
- Avoid lengthy scenario names and lengthy feature names.
- Use the Rule keyword to group scenarios under the business rule they illustrate, which lets scenario names be
  shorter.
- If a scenario name isn't detailed enough, add the detail in the scenario's free-text description.
- If a feature name isn't detailed enough, add the detail in the feature's free-text description.

```gherkin
Feature: Request approvals
  Admins approve or reject the requests that standard users submit.

  Rule: Admins can't decide on their own requests

    Scenario: An admin's own request isn't listed for approval
      Given an admin has a request awaiting approval
      When the admin opens the approvals list
      Then the admin's own request isn't listed
```
