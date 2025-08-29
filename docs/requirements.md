# Portfolio App Requirements

## Overview
- Build a lightweight portfolio web application demonstrating TypeScript across both front-end and API layers.
- Features include a Discord-style board and a contact form.

## Data Models
- **User**: `id`, `name`, `email`, `hashedPassword`, `createdAt`
- **Board**: `id`, `title`, `description`, `createdAt`, `createdBy`
- **Comment**: `id`, `boardId`, `userId`, `body`, `createdAt`
- **ContactMessage**: `id`, `name`, `email`, `message`, `createdAt`

## REST API Endpoints
- `GET /api/boards` – list boards
- `POST /api/boards` – create board
- `GET /api/boards/:id` – board details with comments
- `POST /api/boards/:id/comments` – add comment
- `DELETE /api/comments/:id` – remove comment
- `POST /api/contact` – send contact message

## Front-end
- Single Page Application using TypeScript and Vue/Nuxt.
- Board interface inspired by Discord with a sidebar of posts and inline comment view.
- Contact page for submitting inquiries.

## Non-functional
- Emphasize type safety, unit tests, and CI/CD pipeline.
- Deployment target: AWS (specific service TBD).

