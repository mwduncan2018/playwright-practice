# Super Apps

A practice repo for Playwright test automation: a test project and two example apps to test, all
signing in through Keycloak.

| Folder | What it holds | Status |
| --- | --- | --- |
| `playwright/` | The test automation, with each app's manual test plan | Ready: 20 tests, see [playwright/README.md](playwright/README.md) |
| `super-catalog/` | Super Catalog: React front end, FastAPI back end | Ready at http://localhost:3001 |
| `super-portal/` | Super Portal: React front end, FastAPI back end | Ready at http://localhost:3002 |

The files at the root make up the local environment the tests run against:

- `docker-compose.yml` starts Keycloak, Super Catalog and Super Portal.
- `keycloak-realm.json` defines the users, roles and app clients that Keycloak loads.
- `.gitattributes` keeps Unix line endings, so files still work inside Linux containers when the
  repo is checked out on Windows.

## Start and stop

Docker Desktop must be running.

```bash
docker compose up -d --build --wait   # build the apps, start everything, wait until it's ready
docker compose ps                     # what's running, and whether it's healthy
docker compose logs super-portal      # one service's log: keycloak, super-catalog or super-portal
docker compose down                   # stop, and throw away all data and sign-ins
```

The first build takes a few minutes; later starts take about 30 seconds, mostly Keycloak.

Keycloak loads `keycloak-realm.json` each time its container is created. Changes made in the admin
console last until `docker compose down`; the next start begins again from the file. To change
users, roles or clients for good, edit the file, then run `docker compose down` and
`docker compose up -d --wait`.

Each app reloads its sample data every time it starts, so `docker compose restart super-catalog`
(or `super-portal`) resets that app without touching Keycloak.

## Keycloak

| | |
| --- | --- |
| Version | 26.8.2, pinned in `docker-compose.yml` |
| Realm | `super-apps`, shown as "Super Apps" on the sign-in page |
| Try a sign-in | http://localhost:8080/realms/super-apps/account |
| Admin console | http://localhost:8080/admin, local account `admin` / `admin` |
| Token issuer | `http://localhost:8080/realms/super-apps` |

Keycloak is bound to 127.0.0.1, so other machines on your network can't reach it. To use a
different admin console account, set `KEYCLOAK_ADMIN_USERNAME` and `KEYCLOAK_ADMIN_PASSWORD` before
the container is created.

### Users

Both apps share these users. Each password is the username followed by `-password`, so admin1's is
`admin1-password`.

| Username | Name | Role |
| --- | --- | --- |
| admin1 | Admin One | admin |
| admin2 | Admin Two | admin |
| admin3 | Admin Three | admin |
| admin4 | Admin Four | admin |
| standard1 | Standard One | standard |
| standard2 | Standard Two | standard |
| standard3 | Standard Three | standard |
| standard4 | Standard Four | standard |

| Role | Can |
| --- | --- |
| admin | Create, change and delete records, and approve requests |
| standard | View records and submit requests |

### App clients

| Client | App address |
| --- | --- |
| `super-catalog` | http://localhost:3001 |
| `super-portal` | http://localhost:3002 |

Both are public clients using the authorization code flow with PKCE, the usual setup for a React
app. Keycloak only sends users back to each app's own address. Because both apps use the same realm,
signing in to one signs you in to the other in the same browser.
