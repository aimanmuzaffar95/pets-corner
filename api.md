# API Reference

This document contains endpoint contracts, request/response payloads, and response envelope details for Pets Corner API.

## Endpoints

- `GET /pets`
- `GET /pets/species`
- `GET /pets/:id`
- `POST /pets`
- `PATCH /pets/:id`
- `DELETE /pets/:id`
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me` (JWT bearer required)

## Global response contract (breaking change)

All non-`204` endpoints return a standardized envelope.

Success shape:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-02-21T15:04:05.000Z",
    "path": "/auth/login"
  }
}
```

Error shape:

```json
{
  "success": false,
  "error": {
    "type": "https://api.petscorner.dev/problems/validation",
    "code": "VALIDATION_ERROR",
    "title": "Validation failed",
    "status": 400,
    "detail": "One or more fields are invalid",
    "errors": [
      {
        "field": "email",
        "message": "email must be an email"
      }
    ],
    "timestamp": "2026-02-21T15:04:05.000Z",
    "path": "/auth/register"
  }
}
```

`204 No Content` endpoints (for example `DELETE /pets/:id`) return an empty body.

## Auth payloads

### `POST /auth/register` request

```json
{
  "email": "user@example.com",
  "password": "Strong!123",
  "firstName": "Aiman",
  "lastName": "Muzaffar",
  "bio": "Optional text"
}
```

### `POST /auth/login` request

```json
{
  "email": "user@example.com",
  "password": "Strong!123"
}
```

### `POST /auth/register` success

`data.user` includes `createdAt` and `updatedAt`.

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "expiresIn": "24h",
    "user": {
      "id": "<uuid>",
      "email": "user@example.com",
      "firstName": "Aiman",
      "lastName": "Muzaffar",
      "bio": null,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  },
  "meta": {
    "timestamp": "2026-02-21T15:04:05.000Z",
    "path": "/auth/register"
  }
}
```

### `POST /auth/login` success

`data.user` excludes `createdAt` and `updatedAt`.

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "expiresIn": "24h",
    "user": {
      "id": "<uuid>",
      "email": "user@example.com",
      "firstName": "Aiman",
      "lastName": "Muzaffar",
      "bio": null
    }
  },
  "meta": {
    "timestamp": "2026-02-21T15:04:05.000Z",
    "path": "/auth/login"
  }
}
```
