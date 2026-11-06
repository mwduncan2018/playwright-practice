"""Sign-in: every API call carries a Keycloak access token, checked here."""

from dataclasses import dataclass
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings

_bearer = HTTPBearer(auto_error=False)
_signing_keys = jwt.PyJWKClient(settings.jwks_url, cache_keys=True, lifespan=300)
APP_ROLES = ("admin", "standard")


@dataclass(frozen=True)
class User:
    username: str
    name: str
    email: str
    roles: frozenset[str]

    @property
    def is_admin(self) -> bool:
        return "admin" in self.roles


def _unauthorized(message: str) -> HTTPException:
    return HTTPException(status.HTTP_401_UNAUTHORIZED, message, headers={"WWW-Authenticate": "Bearer"})


def current_user(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)]) -> User:
    """The signed-in user, from a valid token that Keycloak issued to this app."""
    if credentials is None:
        raise _unauthorized("Sign in to use the API.")
    try:
        key = _signing_keys.get_signing_key_from_jwt(credentials.credentials)
        claims = jwt.decode(
            credentials.credentials,
            key.key,
            algorithms=["RS256"],
            issuer=settings.issuer,
            leeway=30,
            options={"verify_aud": False, "require": ["exp", "iat", "iss"]},
        )
    except jwt.PyJWTError as error:
        raise _unauthorized(f"The access token isn't valid: {error}") from error
    if claims.get("azp") != settings.client_id:
        raise _unauthorized("The access token was issued to another application.")
    roles = frozenset(role for role in claims.get("realm_access", {}).get("roles", []) if role in APP_ROLES)
    username = claims.get("preferred_username", "")
    return User(username=username, name=claims.get("name") or username, email=claims.get("email", ""), roles=roles)


def require_admin(user: Annotated[User, Depends(current_user)]) -> User:
    if not user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only admins can do this.")
    return user


CurrentUser = Annotated[User, Depends(current_user)]
AdminUser = Annotated[User, Depends(require_admin)]
