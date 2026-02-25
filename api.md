# API Reference

This document contains endpoint contracts, request/response payloads, and response envelope details for Pets Corner API.

## Endpoints

- `GET /pets`
- `GET /pets/species`
- `GET /pets/:id`
- `POST /pets`
- `PATCH /pets/:id`
- `DELETE /pets/:id`
- `GET /adoption-listings`
- `GET /adoption-listings/:id`
- `POST /adoption-listings` (JWT bearer required)
- `PATCH /adoption-listings/:id` (JWT bearer required)
- `PATCH /adoption-listings/:id/status` (JWT bearer required)
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

## Adoption listing payloads

### `POST /adoption-listings` request

```json
{
  "petId": "<uuid>",
  "title": "Friendly Labrador for adoption",
  "description": "House-trained and calm with kids",
  "adoptionFeeCents": 15000,
  "currency": "USD",
  "city": "Austin",
  "state": "Texas",
  "country": "US"
}
```

`adoptionFeeCents` and `currency` must both be provided or both omitted.

### `PATCH /adoption-listings/:id` request

All fields are optional.

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "adoptionFeeCents": 12000,
  "currency": "USD",
  "city": "Dallas",
  "state": "Texas",
  "country": "US"
}
```

### `PATCH /adoption-listings/:id/status` request

```json
{
  "status": "PUBLISHED"
}
```

Supported status values:

- `DRAFT`
- `PUBLISHED`
- `PAUSED`
- `ADOPTED`
- `WITHDRAWN`
- `EXPIRED`

### Adoption listing success shape

`GET /adoption-listings/:id`, `POST /adoption-listings`, `PATCH /adoption-listings/:id`, and `PATCH /adoption-listings/:id/status` return:

```json
{
  "success": true,
  "data": {
    "id": "<uuid>",
    "petId": "<uuid>",
    "petName": "Milo",
    "petBreed": "Labrador",
    "petAge": 3,
    "speciesId": "<uuid>",
    "speciesCode": "DOG",
    "speciesLabel": "Dog",
    "ownerUserId": "<uuid>",
    "status": "PUBLISHED",
    "title": "Friendly Labrador for adoption",
    "description": "House-trained and calm with kids",
    "adoptionFeeCents": 15000,
    "currency": "USD",
    "city": "Austin",
    "state": "Texas",
    "country": "US",
    "publishedAt": "2026-02-21T15:04:05.000Z",
    "closedAt": null,
    "createdAt": "2026-02-21T15:04:05.000Z",
    "updatedAt": "2026-02-21T15:04:05.000Z"
  },
  "meta": {
    "timestamp": "2026-02-21T15:04:05.000Z",
    "path": "/adoption-listings/<uuid>"
  }
}
```

### `GET /adoption-listings` query params and success

Query params:

- `status`
- `speciesCode`
- `city`
- `state`
- `country`
- `page` (default `1`)
- `limit` (default `20`, max `100`)

Success `data` shape:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 1
  }
}
```
