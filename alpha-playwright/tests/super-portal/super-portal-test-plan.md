# Super Portal Manual Test Plan

- **Application:** Super Portal
- **Version:** 1.1
- **Date:** 2026-11-15
- **Automated tests:** alpha-playwright/tests/super-portal

## 1. Purpose

This plan checks Super Portal's request wizards, how requests are followed, cancelled, approved and rejected, announcements, settings and the All requests table.

## 2. Test environment

- **Application:** Super Portal. Locally at http://localhost:3002
- **Sign-in:** Keycloak, realm super-apps. Locally at http://localhost:8080
- **Data:** The sample data: 100 requests, 6 of them waiting for a decision, and 6 announcements. Locally it's reloaded every time the app starts.

## 3. Test accounts

| Role | Accounts | Can |
| --- | --- | --- |
| Admin | admin1, admin2, admin3, admin4 | Approve and reject other people's requests, see everyone's requests and reports, and add announcements. |
| Standard user | standard1, standard2, standard3, standard4 | Make requests and follow their own. |

Passwords come from the test team and are never written in this plan or in the repo. In the local environment, each password is the username followed by -password.

## 4. How to use this plan

- Each case says who to sign in as, lists any test data, and has numbered steps. After each step, check every expected result.
- Where test data says Unique, use a value no other record has, such as one with the date and time in it. The automated tests run side by side in one environment, so no two of them may share a record.
- Tags: Smoke cases are the short check that runs in every environment, including staging, where only Smoke cases run. Regression cases run in dev, test and locally.
- Record Pass or Fail for each step. When an expected result doesn't happen, write down what did.
- The automated tests follow this plan. Each test is named with the case's ID and title. Each step in a test's report starts with the step's number and its action exactly as written here, and each check carries the expected result's wording.

## 5. Cases

| ID | Title | Tags | Signed in as |
| --- | --- | --- | --- |
| [SP-001](#sp-001-request-equipment-shipped-to-an-address) | Request equipment shipped to an address | Smoke | Standard user |
| [SP-002](#sp-002-change-answers-with-back-and-edit) | Change answers with Back and Edit | Regression | Standard user |
| [SP-003](#sp-003-administrator-access-adds-a-security-review) | Administrator access adds a security review | Regression | Standard user |
| [SP-004](#sp-004-discard-an-unfinished-request) | Discard an unfinished request | Regression | Standard user |
| [SP-005](#sp-005-comment-on-and-cancel-your-request) | Comment on and cancel your request | Regression | Standard user |
| [SP-006](#sp-006-an-admin-approves-a-request) | An admin approves a request | Smoke | Standard user, then an admin in a second browser |
| [SP-007](#sp-007-an-admin-rejects-a-request) | An admin rejects a request | Regression | Standard user, then an admin in a second browser |
| [SP-008](#sp-008-admins-cant-decide-on-their-own-requests) | Admins can't decide on their own requests | Regression | Admin |
| [SP-009](#sp-009-schedule-an-announcement-for-standard-users) | Schedule an announcement for standard users | Regression | Admin, then a standard user in a second browser |
| [SP-010](#sp-010-settings-set-the-wizards-default-priority) | Settings set the wizard's default priority | Regression | Standard user |
| [SP-011](#sp-011-choose-and-order-the-all-requests-columns) | Choose and order the All requests columns | Regression | Admin |
| [SP-012](#sp-012-find-a-request-on-all-requests-and-check-who-decided-it) | Find a request on All requests and check who decided it | Regression | Standard user, then an admin in a second browser |
| [SP-013](#sp-013-filter-and-page-through-all-requests) | Filter and page through All requests | Regression | Admin |
| [SP-014](#sp-014-standard-users-cant-open-all-requests) | Standard users can't open All requests | Regression | Standard user |

## 6. Test cases

### SP-001 Request equipment shipped to an address

- **Tags:** Smoke
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:**
  - **Item:** Monitor
  - **Quantity:** 2
  - **Delivery:** Ship to an address
  - **Address:** 500 Market Street, Seattle, WA 98101
  - **Priority:** High
  - **Reason:** Two monitors for my new desk in the Seattle office.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open New request and select Request equipment. | The Request equipment wizard opens at "Step 1 of 4". | |
| 2 | Select Next without choosing anything. | Item says "Choose an item."<br>The wizard stays at "Step 1 of 4". | |
| 3 | Choose the item and quantity, then select Next. | The Delivery step opens at "Step 2 of 4". | |
| 4 | Choose Ship to an address and select Next without entering an address. | Delivery address says "Enter the full delivery address." | |
| 5 | Enter the address and select Next. | The Priority and reason step opens at "Step 3 of 4". | |
| 6 | Choose the priority, enter the reason, and select Next. | The Review step shows the item, quantity, delivery, address, priority and reason. | |
| 7 | Select Submit request. | The wizard says "Request submitted" and shows the new request's number. | |
| 8 | Select View request. | The request's page is titled with its number and "Monitor × 2".<br>The status is Submitted.<br>The page shows the delivery address. | |

### SP-002 Change answers with Back and Edit

- **Tags:** Regression
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:**
  - **Software:** Figma, then Miro
  - **License length:** 1 year
  - **Seats:** 3
  - **Reason:** Our team plans projects on a shared whiteboard.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open New request and select Request software. | The Request software wizard opens at "Step 1 of 4". | |
| 2 | Choose Figma and select Next, then choose 1 year and 3 seats and select Next. | The Priority and reason step opens at "Step 3 of 4". | |
| 3 | Select Back. | The License step still shows 1 year and 3 seats. | |
| 4 | Select Next, enter the reason, and select Next. | The Review step shows Figma, 1 year and 3 seats. | |
| 5 | Select Edit for Software, choose Miro, and select Next until the Review step. | The Review step shows Miro. | |
| 6 | Select Submit request, then select View request. | The request's page is titled with its number and "Miro (1 year)".<br>The page shows 3 seats. | |

### SP-003 Administrator access adds a security review

- **Tags:** Regression
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:**
  - **System:** Production database
  - **Access level:** Administrator
  - **Security reason:** I rotate the database credentials during the monthly maintenance window.
  - **Reason:** Credential rotation is part of my on-call duties.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open New request and select Request access. | The Request access wizard opens at "Step 1 of 3". | |
| 2 | Choose the system and the access level. | The wizard now says "Step 1 of 4".<br>A Security review step is added to the list of steps. | |
| 3 | Select Next, then select Next again without filling in the security review. | The reason field says "Explain in at least 20 characters why you need administrator access."<br>The training box says "Confirm that you've completed security training." | |
| 4 | Enter the security reason, check the security training box, and select Next. | The Priority and reason step opens at "Step 3 of 4". | |
| 5 | Enter the reason, select Next, then select Submit request. | The wizard says "Request submitted". | |
| 6 | Select View request. | The request shows access level Administrator.<br>The request shows security training as Completed. | |

### SP-004 Discard an unfinished request

- **Tags:** Regression
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:** None.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open New request, select Request equipment, and choose Laptop in Item. | Item shows Laptop. | |
| 2 | Select Cancel. | The wizard asks "Discard this request?" and offers Keep editing and Discard. | |
| 3 | Select Keep editing. | The Equipment step is back, with Laptop still chosen. | |
| 4 | Close the wizard with its X, then select Discard. | The wizard closes. | |
| 5 | Select Request equipment again. | The wizard starts again at "Step 1 of 4" with no item chosen. | |

### SP-005 Comment on and cancel your request

- **Tags:** Regression
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:**
  - **Request:** Equipment: Keyboard, quantity 1, Deliver to my desk
  - **Reason:** The keys on my keyboard stick.
  - **Comment:** Any full-size keyboard is fine.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Submit the request in the test data, then select View request. | The request's page shows the status Submitted and a Cancel request button. | |
| 2 | Enter the comment and select Post comment. | The message "Comment posted." appears.<br>The history lists the comment. | |
| 3 | Select Cancel request, then select Keep request. | The dialog closes and the status is still Submitted. | |
| 4 | Select Cancel request, then select Cancel request in the dialog. | The message "Cancelled \<number>." appears.<br>The status is Cancelled, and the page says the user cancelled it.<br>There's no Cancel request button. | |

### SP-006 An admin approves a request

- **Tags:** Smoke
- **Signed in as:** Standard user, then an admin in a second browser
- **Preconditions:** None.
- **Test data:**
  - **Request:** Software: Tableau, 6 months, 1 seat
  - **Reason:** I build the sales dashboards each quarter.
  - **Approval note:** Approved for this quarter.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | As the standard user, submit the request in the test data. | The wizard shows the new request's number. | |
| 2 | As an admin, open Approvals. | The request is listed. | |
| 3 | Select Approve for the request, enter the note, and select Approve. | The message "Approved \<number>." appears.<br>The request is no longer listed. | |
| 4 | As the standard user, open the request. | The status is Approved.<br>The page says the admin approved it, with the note.<br>The history ends with Approved. | |

### SP-007 An admin rejects a request

- **Tags:** Regression
- **Signed in as:** Standard user, then an admin in a second browser
- **Preconditions:** None.
- **Test data:**
  - **Request:** Access: Customer CRM, Read only
  - **Reason:** I need to read customer records for support tickets.
  - **Rejection reason:** Ask your team lead to request access for the whole team.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | As the standard user, submit the request in the test data. | The wizard shows the new request's number. | |
| 2 | As an admin, open the request and select Reject. | A Reject dialog opens for the request. | |
| 3 | Select Reject without entering a reason. | The dialog says "Tell the requester why, in at least 5 characters." | |
| 4 | Enter the rejection reason and select Reject. | The message "Rejected \<number>." appears.<br>The status is Rejected, and the page shows the reason. | |
| 5 | As the standard user, open My requests and choose Rejected in Status. | The request is listed as Rejected. | |

### SP-008 Admins can't decide on their own requests

- **Tags:** Regression
- **Signed in as:** Admin
- **Preconditions:** None.
- **Test data:**
  - **Request:** Equipment: Headset, quantity 1, Pick up at the IT desk
  - **Reason:** My headset's microphone stopped working.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Submit the request in the test data. | The wizard shows the new request's number. | |
| 2 | Open Approvals. | The request isn't listed. | |
| 3 | Open the request. | The page says "You can't approve or reject your own request. Another admin will decide on it."<br>There are no Approve or Reject buttons. | |

### SP-009 Schedule an announcement for standard users

- **Tags:** Regression
- **Signed in as:** Admin, then a standard user in a second browser
- **Preconditions:** None.
- **Test data:**
  - **Title:** Unique: Test announcement followed by the date and time
  - **Message:** The cafeteria opens an hour later on Friday.
  - **Audience:** Standard users only
  - **Publish on:** Three days from today
  - **Pinned:** Yes

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | As the admin, open Announcements and select New announcement. | The New announcement wizard opens at "Step 1 of 4". | |
| 2 | Select Next without entering anything. | Title says "Enter a title."<br>Message says "Enter the message." | |
| 3 | Enter the title and message and select Next. Choose the audience and select Next. Choose Schedule for a later date, enter the date, check the pin box, and select Next. | The Review step shows "Standard users only" and the date at 09:00 UTC. | |
| 4 | Select Schedule announcement, then select View announcement. | The announcement's page says it's scheduled.<br>The audience is "Standard users only". | |
| 5 | As the standard user, open Announcements. | The announcement isn't listed. | |
| 6 | As the admin, delete the announcement. | The message "Deleted the announcement." appears. | |

### SP-010 Settings set the wizard's default priority

- **Tags:** Regression
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:**
  - **Default priority:** Urgent, then back to Normal

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open the user menu and select Settings. | The Settings page shows the user's username and the role standard. | |
| 2 | Choose Urgent in Default priority for new requests and select Save settings. | The message "Settings saved." appears. | |
| 3 | Reload the page. | Default priority for new requests still shows Urgent. | |
| 4 | Open New request, select Request access, choose HR records and Read only, and select Next. | The Priority and reason step has Urgent selected. | |
| 5 | Close the wizard with its X and select Discard. | The wizard closes. | |
| 6 | Open Settings, choose Normal in Default priority for new requests, and select Save settings. | The message "Settings saved." appears. | |

### SP-011 Choose and order the All requests columns

- **Tags:** Regression
- **Signed in as:** Admin
- **Preconditions:** All requests shows its default columns. Columns, then Reset to default and Save columns, puts them back.
- **Test data:** None.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open All requests. | The table's columns are Number, Title, Type, Requester, Priority, Status and Submitted, in that order. | |
| 2 | Select Columns. | The Choose columns dialog opens.<br>Number is checked and can't be unchecked.<br>Needed by, Updated and Decided by aren't checked. | |
| 3 | Check Decided by, uncheck Type, select the up arrow (↑) for Decided by three times, and select Save columns. | The dialog closes.<br>The table's columns are Number, Title, Requester, Priority, Status, Decided by and Submitted, in that order. | |
| 4 | Reload the page. | The table's columns are still Number, Title, Requester, Priority, Status, Decided by and Submitted. | |
| 5 | Select Columns, uncheck Decided by, and select Cancel. | The dialog closes.<br>Decided by is still shown. | |
| 6 | Select Columns, select Reset to default, and select Save columns. | The table's columns are Number, Title, Type, Requester, Priority, Status and Submitted again. | |

### SP-012 Find a request on All requests and check who decided it

- **Tags:** Regression
- **Signed in as:** Standard user, then an admin in a second browser
- **Preconditions:** All requests shows its default columns. Columns, then Reset to default and Save columns, puts them back.
- **Test data:**
  - **Request:** Equipment: Webcam, quantity 1, Deliver to my desk
  - **Reason:** My laptop's camera is too dark for video calls.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | As the standard user, submit the request in the test data. | The wizard shows the new request's number. | |
| 2 | As an admin, open All requests, select Columns, check Decided by, select the down arrow (↓) for Requester twice, and select Save columns. | The table's columns are Number, Title, Type, Priority, Status, Requester, Submitted and Decided by, in that order. | |
| 3 | Search for the request's number. | The request is listed, with the standard user as its requester.<br>Its Status is Submitted, and Decided by shows "—". | |
| 4 | Open the request, select Approve, and select Approve in the dialog. | The message "Approved \<number>." appears.<br>The status is Approved. | |
| 5 | Open All requests and search for the request's number. | Its Status is Approved, and Decided by shows the admin's name. | |

### SP-013 Filter and page through All requests

- **Tags:** Regression
- **Signed in as:** Admin
- **Preconditions:** The admin's Rows per page setting is 10, the default. All requests shows its default columns.
- **Test data:**
  - **Requester:** Standard Four, who has 13 requests in the sample data
  - **Waiting request:** REQ-1098, Customer CRM: Read only, the only one of Standard Four's requests that's waiting

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open All requests and choose Standard Four in Requester. | The page says "Showing 1–10 of 13 requests". | |
| 2 | Select the next-page arrow (›). | The page says "Showing 11–13 of 13 requests".<br>Page 2 is marked as the current page. | |
| 3 | Choose Submitted in Status. | The page says "Showing 1–1 of 1 request".<br>The only request listed is REQ-1098, Customer CRM: Read only. | |
| 4 | Select Clear filters. | Requester shows Everyone and Status shows All statuses.<br>The page says "Showing 1–10 of" and the total. | |

### SP-014 Standard users can't open All requests

- **Tags:** Regression
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:** None.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open Home and look at the menu at the top of the page. | There's no All requests link. | |
| 2 | Go to the address /all-requests. | The page says "You don't have access to this page". | |
