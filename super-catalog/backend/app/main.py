"""Super Catalog's server: the API under /api, and the built React app for every other path."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .auth import CurrentUser
from .config import settings
from .db import reset_database
from .routers import activity, categories, dashboard, products, suppliers
from .schemas import MeOut


@asynccontextmanager
async def lifespan(_app: FastAPI):
    reset_database()
    yield


app = FastAPI(title="Super Catalog API", lifespan=lifespan)


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/config.json", include_in_schema=False)
def frontend_config() -> dict[str, str]:
    """Where the front end finds Keycloak. Read at runtime, so one image works in any environment."""
    return {"keycloakUrl": settings.keycloak_url, "realm": settings.realm, "clientId": settings.client_id}


@app.get("/api/me", response_model=MeOut, tags=["me"])
def me(user: CurrentUser) -> MeOut:
    return MeOut(
        username=user.username, name=user.name, email=user.email, roles=sorted(user.roles), is_admin=user.is_admin
    )


for module in (dashboard, products, categories, suppliers, activity):
    app.include_router(module.router)


if settings.static_dir:
    static_dir = Path(settings.static_dir).resolve()
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def frontend(path: str):
        if path == "api" or path.startswith("api/"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        file = (static_dir / path).resolve()
        if path and file.is_file() and static_dir in file.parents:
            return FileResponse(file)
        # Every app route (/products, /products/12/edit, ...) gets the app, which routes in the browser.
        return FileResponse(static_dir / "index.html", headers={"Cache-Control": "no-cache"})
