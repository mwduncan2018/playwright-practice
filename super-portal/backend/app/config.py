"""Settings, read from environment variables so the same image runs in every environment."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    keycloak_url: str
    """Keycloak's address as browsers see it. Tokens name it as their issuer."""
    keycloak_internal_url: str
    """Keycloak's address as this server sees it, for fetching the token signing keys."""
    realm: str
    client_id: str
    database_path: str
    keep_data: bool
    """Keep an existing database at startup instead of reloading the sample data."""
    static_dir: str | None
    """The built front end. When set, this server serves the app as well as the API."""

    @property
    def issuer(self) -> str:
        return f"{self.keycloak_url}/realms/{self.realm}"

    @property
    def jwks_url(self) -> str:
        return f"{self.keycloak_internal_url}/realms/{self.realm}/protocol/openid-connect/certs"


def _load() -> Settings:
    keycloak_url = os.environ.get("KEYCLOAK_URL", "http://localhost:8080").rstrip("/")
    return Settings(
        keycloak_url=keycloak_url,
        keycloak_internal_url=os.environ.get("KEYCLOAK_INTERNAL_URL", keycloak_url).rstrip("/"),
        realm=os.environ.get("KEYCLOAK_REALM", "super-apps"),
        client_id=os.environ.get("KEYCLOAK_CLIENT_ID", "super-portal"),
        database_path=os.environ.get("DATABASE_PATH", "super-portal.db"),
        keep_data=os.environ.get("KEEP_DATA", "").lower() in {"1", "true", "yes"},
        static_dir=os.environ.get("STATIC_DIR") or None,
    )


settings = _load()
