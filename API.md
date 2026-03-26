# API Reference

Base URL: `http://localhost:3001/api`

All endpoints except `/auth/login` and `/health` require a JWT token in the request header:

```
Authorization: Bearer <token>
```

---

## Endpoints

| Method | Path            | Auth required | Description                          |
|--------|-----------------|---------------|--------------------------------------|
| POST   | /auth/login     | No            | Log in and get a token               |
| GET    | /tasks          | Yes           | List tasks with filters + pagination |
| GET    | /tasks/:id      | Yes           | Get one task                         |
| POST   | /tasks          | Yes           | Create a task                        |
| PUT    | /tasks/:id      | Yes           | Update a task                        |
| DELETE | /tasks/:id      | Yes           | Soft-delete a task                   |
| GET    | /users          | Yes           | List all team members                |
| GET    | /users/me       | Yes           | Get your own profile                 |
| GET    | /health         | No            | Server health check                  |

---

## Auth

### POST /auth/login

**Request body**

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**200 — success**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm1abc123",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "ADMIN"
  }
}
```

**401 — wrong credentials**

```json
{ "message": "Invalid email or password." }
```

The same message is returned whether the email or password is wrong. Distinguishing them would let someone check which emails are registered.

**400 — validation error**

```json
{
  "message": "Validation failed",
  "errors": [
    { "msg": "A valid email address is required.", "path": "email" }
  ]
}
```

---

## Tasks

### GET /tasks

Returns a paginated list of tasks. All query parameters are optional.

| Parameter      | Example        | Description                                   |
|----------------|----------------|-----------------------------------------------|
| status         | IN_PROGRESS    | TODO, IN_PROGRESS, or DONE                    |
| assignedToId   | cm1user2       | Filter by assigned user ID                    |
| search         | authentication | Matches against title and description         |
| page           | 2              | Page number, default 1                        |
| limit          | 5              | Per page, default 10, max 50                  |

**Example**

```
GET /api/tasks?status=TODO&page=1&limit=5
```

**200 — success**

```json
{
  "data": [
    {
      "id": "cm1abc123",
      "title": "Write API documentation",
      "description": "Document all endpoints with examples.",
      "status": "TODO",
      "priority": "MEDIUM",
      "dueDate": "2024-12-30T00:00:00.000Z",
      "createdAt": "2024-11-01T10:00:00.000Z",
      "updatedAt": "2024-11-15T12:30:00.000Z",
      "assignedTo": {
        "id": "cm1user2",
        "name": "Bob Smith",
        "email": "bob@example.com"
      },
      "createdBy": {
        "id": "cm1user1",
        "name": "Alice Johnson",
        "email": "alice@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 7,
    "totalPages": 2
  }
}
```

---

### GET /tasks/:id

**200** — same shape as a single item above.

**404**

```json
{ "message": "Task not found." }
```

---

### POST /tasks

The `createdBy` field is set automatically from the JWT — don't include it in the body.

**Request body**

```json
{
  "title": "Add unit tests",
  "description": "Cover the task service with Jest.",
  "status": "TODO",
  "priority": "HIGH",
  "assignedToId": "cm1user2",
  "dueDate": "2025-01-05"
}
```

| Field        | Required | Notes                                          |
|--------------|----------|------------------------------------------------|
| title        | Yes      | Max 200 characters                             |
| description  | No       | Free text                                      |
| status       | No       | Defaults to TODO                               |
| priority     | No       | Defaults to MEDIUM                             |
| assignedToId | No       | Must be an existing, active user ID            |
| dueDate      | No       | ISO 8601 — YYYY-MM-DD                          |

**201 — created**, returns the full task object.

**400 — assignee doesn't exist**

```json
{ "message": "Assigned user not found." }
```

---

### PUT /tasks/:id

Only include the fields you want to change. Everything else stays as-is.

Admins can update any task. Members can only update tasks that are assigned to them.

**Request body** (all fields optional)

```json
{
  "status": "DONE",
  "assignedToId": null
}
```

Pass `null` for `assignedToId` to clear the assignment. Pass `null` for `dueDate` to remove it.

**200** — returns the updated task.

**403 — task is not assigned to you**

```json
{ "message": "You can only edit tasks assigned to you." }
```

**404**

```json
{ "message": "Task not found." }
```

---

### DELETE /tasks/:id

Soft-deletes the task. The record stays in the database with `deletedAt` set — it just won't show up in any results. This preserves history and makes it recoverable.

Admins can delete any task. Members can only delete tasks that are assigned to them.

**204** — no response body.

**403 — task is not assigned to you**

```json
{ "message": "You can only delete tasks assigned to you." }
```

**404**

```json
{ "message": "Task not found." }
```

---

## Users

### GET /users

Lists all active users sorted by name. Used to populate the assignee dropdown.

**200**

```json
[
  {
    "id": "cm1user1",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "ADMIN",
    "createdAt": "2024-11-01T10:00:00.000Z"
  },
  {
    "id": "cm1user2",
    "name": "Bob Smith",
    "email": "bob@example.com",
    "role": "MEMBER",
    "createdAt": "2024-11-01T10:00:00.000Z"
  }
]
```

---

### GET /users/me

Returns the profile of whoever owns the token.

**200** — same shape as one user above.

---

## Health Check

### GET /health

No auth needed.

```
GET http://localhost:3001/health
```

**200**

```json
{
  "status": "ok",
  "timestamp": "2024-11-01T12:00:00.000Z"
}
```

---

## Error Format

Every error response has the same shape:

```json
{ "message": "Description of what went wrong." }
```

Validation errors also include field-level detail:

```json
{
  "message": "Validation failed",
  "errors": [
    { "msg": "Title is required.", "path": "title", "location": "body" }
  ]
}
```

---

## Status Codes

| Code | Meaning                                              |
|------|------------------------------------------------------|
| 200  | Success                                              |
| 201  | Resource created                                     |
| 204  | Success, no content (delete)                         |
| 400  | Bad input — validation failed or a reference is missing |
| 401  | Missing or invalid token                             |
| 403  | Token is valid but you don't have permission         |
| 404  | Resource not found                                   |
| 500  | Something broke on the server                        |

---

## Quick Test with curl

```bash
# Log in and save the token to a variable
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# List tasks
curl http://localhost:3001/api/tasks -H "Authorization: Bearer $TOKEN"

# Filter to To Do only
curl "http://localhost:3001/api/tasks?status=TODO" -H "Authorization: Bearer $TOKEN"

# Create a task
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test via curl","priority":"HIGH"}'

# Update a task
curl -X PUT http://localhost:3001/api/tasks/TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE"}'

# Delete a task
curl -X DELETE http://localhost:3001/api/tasks/TASK_ID \
  -H "Authorization: Bearer $TOKEN"
```
