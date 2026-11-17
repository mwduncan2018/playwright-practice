# Super Catalog Manual Test Plan

- **Application:** Super Catalog
- **Version:** 1.0
- **Date:** 2026-11-06
- **Automated tests:** charlie-playwright/tests/super-catalog

## 1. Purpose

This plan checks Super Catalog's sign-in, dashboard, product list, product changes, categories and access rules.

## 2. Test environment

- **Application:** Super Catalog. Locally at http://localhost:3001
- **Sign-in:** Keycloak, realm super-apps. Locally at http://localhost:8080
- **Data:** The sample data: 60 products in 6 categories from 8 suppliers. Locally it's reloaded every time the app starts.

## 3. Test accounts

| Role | Accounts | Can |
| --- | --- | --- |
| Admin | admin1, admin2, admin3, admin4 | Create, change and delete records, and see the activity log. |
| Standard user | standard1, standard2, standard3, standard4 | View everything, change nothing. |

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
| [SC-001](#sc-001-sign-in-and-sign-out) | Sign in and sign out | Smoke | Nobody at first. The case signs in as a standard user. |
| [SC-002](#sc-002-dashboard-counts-and-low-stock-products) | Dashboard counts and low-stock products | Smoke | Standard user |
| [SC-003](#sc-003-search-and-filter-products) | Search and filter products | Regression | Standard user |
| [SC-004](#sc-004-sort-page-through-and-export-products) | Sort, page through and export products | Regression | Standard user |
| [SC-005](#sc-005-create-a-product) | Create a product | Smoke | Admin |
| [SC-006](#sc-006-product-form-validation) | Product form validation | Regression | Admin |
| [SC-007](#sc-007-edit-a-product-and-add-an-image) | Edit a product and add an image | Regression | Admin |
| [SC-008](#sc-008-delete-a-product) | Delete a product | Regression | Admin |
| [SC-009](#sc-009-add-rename-and-delete-a-category) | Add, rename and delete a category | Regression | Admin |
| [SC-010](#sc-010-standard-users-can-view-but-not-change) | Standard users can view but not change | Smoke | Standard user |

## 6. Test cases

### SC-001 Sign in and sign out

- **Tags:** Smoke
- **Signed in as:** Nobody at first. The case signs in as a standard user.
- **Preconditions:** Signed out of Keycloak.
- **Test data:**
  - **Account:** A standard user's username and password
  - **Wrong password:** Anything that isn't the password, such as wrong-password

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open Super Catalog. | Keycloak's sign-in page opens, with the title "Sign in to Super Apps". | |
| 2 | Enter the username and the wrong password, then select Sign In. | The page says "Invalid username or password." | |
| 3 | Enter the username and the correct password, then select Sign In. | The Dashboard opens and says "Welcome, \<name>." with the user's name.<br>The user's name is shown at the top right. | |
| 4 | Open the user menu and select Sign out. | Keycloak's sign-in page opens again. | |

### SC-002 Dashboard counts and low-stock products

- **Tags:** Smoke
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:** None.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open the Dashboard. | The browser tab's title is "Dashboard · Super Catalog".<br>Counts are shown for Products, Active products, Low stock, Categories and Suppliers.<br>The Suppliers count is 8. | |
| 2 | Select "See all low-stock products". | The Products page opens with "Low stock only" checked.<br>Every product listed has a Low badge. | |

### SC-003 Search and filter products

- **Tags:** Regression
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:** None.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open the Products page and enter "lamp" in Search. | Exactly two products are listed: LED Desk Lamp and LED Headlamp.<br>The address includes search=lamp. | |
| 2 | Select Clear filters. | Search is empty again. | |
| 3 | Choose Toys & Games in Category and Active in Status. | The page says "Showing 1–9 of 9 products". | |
| 4 | Check "Low stock only". | Exactly two products are listed: Remote Control Car and Stunt Kite. | |
| 5 | Enter 30 in Min price. | Only Remote Control Car is listed. | |

### SC-004 Sort, page through and export products

- **Tags:** Regression
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:** None.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open the Products page and choose Electronics in Category. | The page says "Showing 1–10 of 10 products". | |
| 2 | Select the Price column heading twice. | The Price column is sorted from highest to lowest.<br>The first product is 27-inch Monitor at $279.00. | |
| 3 | Select the Price column heading again. | The first product is USB-C Charging Cable at $12.99. | |
| 4 | Select Export CSV. | A file named products-\<today's date>.csv downloads.<br>The file has a heading row and 10 product rows. | |
| 5 | Select Clear filters, choose 25 in Rows per page, then select the next-page arrow (›). | The page says "Showing 26–50 of" and the total.<br>Page 2 is marked as the current page. | |

### SC-005 Create a product

- **Tags:** Smoke
- **Signed in as:** Admin
- **Preconditions:** None.
- **Test data:**
  - **SKU:** Unique: three capital letters, a dash and four digits, such as ZQX-4821
  - **Name:** Test product followed by the SKU, such as Test product ZQX-4821
  - **Category:** Home & Kitchen
  - **Supplier:** Granite Works
  - **Price:** 19.99
  - **Stock:** 25
  - **Status:** Draft

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open the Products page and select New product. | The New product form opens. | |
| 2 | Fill in the form with the test data and select Create product. | The message "Created \<SKU> \<name>." appears.<br>The product's page shows price $19.99, stock 25, status Draft and supplier Granite Works.<br>The product's page says it was created by the signed-in admin. | |
| 3 | Open the Products page and search for the SKU. | Exactly one product is listed: the new one. | |

### SC-006 Product form validation

- **Tags:** Regression
- **Signed in as:** Admin
- **Preconditions:** None.
- **Test data:**
  - **Duplicate SKU:** ELE-1001, which USB-C Charging Cable already uses
  - **Name:** Test product with a duplicate SKU
  - **Category:** Home & Kitchen
  - **Price:** 10.00
  - **Bad stock:** -1

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open the New product form and select Create product without entering anything. | SKU says "Enter a SKU like ABC-1234: three capital letters, a dash and four digits."<br>Name says "Enter a name."<br>Category says "Choose a category."<br>Price (USD) says "Enter a price greater than 0 and no more than 100,000." | |
| 2 | Enter the duplicate SKU and the other test data, then select Create product. | SKU says "Another product already uses SKU ELE-1001."<br>The New product form is still open. | |
| 3 | Enter the bad stock and select Create product. | Stock says "Enter a whole number, 0 or more." | |

### SC-007 Edit a product and add an image

- **Tags:** Regression
- **Signed in as:** Admin
- **Preconditions:** None.
- **Test data:**
  - **Product:** A new product, made as in SC-005 with its own unique SKU
  - **New price:** 24.50
  - **New stock:** 3
  - **Image:** A PNG or JPEG of 1 MB or less, such as product.png

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Create a product with the test data. | The product's page opens. | |
| 2 | Select Edit, enter the new price and stock, choose the image, and select Save changes. | The message "Saved changes to \<SKU> \<name>." appears.<br>The product's page shows price $24.50 and stock 3 with a Low stock badge.<br>The product's photo is shown. | |
| 3 | Open the Activity log and choose Product in Type. | An Updated entry for the product says "Price: 19.99 → 24.50; Stock: 25 → 3". | |

### SC-008 Delete a product

- **Tags:** Regression
- **Signed in as:** Admin
- **Preconditions:** None.
- **Test data:**
  - **Product:** A new product, made as in SC-005 with its own unique SKU

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Create a product with the test data. | The product's page opens. | |
| 2 | Select Delete. | A Delete product dialog asks "Delete \<SKU> \<name>? This can't be undone." | |
| 3 | Select Cancel. | The dialog closes, and the product's page is still shown. | |
| 4 | Select Delete, then select Delete in the dialog. | The message "Deleted \<SKU> \<name>." appears.<br>The Products page opens. | |
| 5 | Search the Products page for the SKU. | The page says "No products match these filters." | |

### SC-009 Add, rename and delete a category

- **Tags:** Regression
- **Signed in as:** Admin
- **Preconditions:** None.
- **Test data:**
  - **Name:** Unique: Test category followed by the date and time, such as Test category 2026-11-06 14:03
  - **New name:** The name followed by (renamed)
  - **Existing name:** Electronics

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open Categories and select New category. | The New category dialog opens. | |
| 2 | Enter the name and select Save. | The message "Created the \<name> category." appears.<br>The category is listed with 0 products. | |
| 3 | Select Edit for the category, enter the existing name, and select Save. | The dialog says "A category named Electronics already exists." | |
| 4 | Enter the new name and select Save. | The category is listed under its new name. | |
| 5 | Select Delete for Electronics, then select Delete in the dialog. | The dialog says "Electronics has 10 products, so it can't be deleted. Move or delete them first." | |
| 6 | Select OK, then select Delete for the renamed category and Delete in the dialog. | The message "Deleted the \<new name> category." appears.<br>The category is no longer listed. | |

### SC-010 Standard users can view but not change

- **Tags:** Smoke
- **Signed in as:** Standard user
- **Preconditions:** None.
- **Test data:** None.

| Step | Action | Expected result | Pass/Fail |
| --- | --- | --- | --- |
| 1 | Open the Products page. | There's no New product button. | |
| 2 | Open Adjustable Dumbbells. | The product's page shows SKU SPO-1002.<br>There are no Edit or Delete buttons. | |
| 3 | Go to the address /products/new. | The page says "You don't have access to this page". | |
| 4 | Look at the menu at the top of the page. | There's no Activity log link. | |
