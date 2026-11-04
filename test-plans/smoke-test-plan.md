# Smoke test plan - Research site

Stands in for the Word manual test plan. Each case ID appears in the title of the
automated test that covers it, so `npx playwright test -g "DATA-002"` runs one case.

Applies to every case: the site is running, and no case opens or changes Selected Strategies,
Strategies, Rejected Strategies, Selected After Cost & Tax, After Cost & Tax or Rejected After
Cost & Tax. The site root redirects to Strategies, so no case starts there.

## NAV-001 Move between the documentation pages with the site menu

| Step | Action | Expected result |
| --- | --- | --- |
| 1 | Open Data pages (`/results/index.html`) | Heading "Data pages" |
| 2 | In the site menu, click "Research README" | Heading "Research" |
| 3 | In the site menu, click "Strategies README" | Heading "Strategies" |
| 4 | In the site menu, click "Data pages" | Heading "Data pages" |

## NAV-002 Return to the index from a data page

| Step | Action | Expected result |
| --- | --- | --- |
| 1 | Open the Gap fills data page (`/results/gap_fills.html`) | Heading "Gap fills on volatile days" |
| 2 | In the site menu, click "Data pages" | Heading "Data pages" |

## DATA-001 The Data pages index describes and lists the analyses

| Step | Action | Expected result |
| --- | --- | --- |
| 1 | Open Data pages | Text "The analyses the strategies are built on" |
| 2 | Look at the list of pages | Links "Calm days", "Gap fills" and "Streak screen" are shown |

## DATA-002 Open a data page from the index

Run once for each row.

| Link | Expected heading |
| --- | --- |
| Buying the break of -1.0 | Buying the break of -1.0 |
| Calm days | Calm days |
| Gap fills | Gap fills on volatile days |
| Morning setups | Morning setups |
| Robustness of the lead strategies | Robustness of the lead strategies |

| Step | Action | Expected result |
| --- | --- | --- |
| 1 | Open Data pages | Heading "Data pages" |
| 2 | Click the link | The page with the expected heading opens |

## DOC-001 The Research README says where things stand

| Step | Action | Expected result |
| --- | --- | --- |
| 1 | Open the Research README (`/README.md`) | Heading "Research" |
| 2 | Read the sections | Sections beginning "Where things stand" and "Pipeline" are shown |

## DOC-002 The Strategies README explains how to add a strategy

| Step | Action | Expected result |
| --- | --- | --- |
| 1 | Open the Strategies README (`/strategies/README.md`) | Heading "Strategies" |
| 2 | Read the sections | Sections "Universe names" and "Adding one" are shown |
