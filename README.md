# KhmerLance

**KhmerLance** is a full-stack freelancer marketplace platform built for the Cambodian market. It enables clients to post projects, freelancers to submit proposals, and both parties to collaborate through contracts, real-time messaging, and reviews — all within a single cohesive product.

Live: **[https://khmerlance.site](https://khmerlance.site)**

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Architecture](#architecture)
  - [Backend Architecture](#backend-architecture)
  - [Frontend Architecture](#frontend-architecture)
  - [Authentication Flow](#authentication-flow)
  - [Real-Time System](#real-time-system)
  - [File Storage](#file-storage)
- [Domain Model](#domain-model)
- [API Reference](#api-reference)
- [Frontend Pages & Routes](#frontend-pages--routes)
- [State Management](#state-management)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Deployment](#deployment)

---

## Overview

KhmerLance implements the complete lifecycle of freelance work:

1. **Discovery** — Clients post projects with budget ranges, categories, experience levels, and deadlines. Anyone can browse and search the public project board.
2. **Bidding** — Authenticated freelancers submit proposals with a pitch and offered price.
3. **Contracting** — Clients accept a proposal, which atomically creates a contract and assigns the freelancer to the project.
4. **Collaboration** — Both parties communicate via a real-time WebSocket-based chat scoped to the contract, with file attachments stored on Cloudflare R2.
5. **Completion** — The client marks the contract complete. Either party can then leave a star rating and written review.
6. **Administration** — An admin panel provides platform-wide moderation: user management (ban/unban), project removal, and category management.

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Java 21 |
| Framework | Spring Boot 3.3.2 |
| Security | Spring Security 6 + JWT (JJWT 0.11.5) |
| Persistence | Spring Data JPA + Hibernate |
| Database | PostgreSQL |
| Real-time | Spring WebSocket (STOMP over SockJS) |
| Object Storage | Cloudflare R2 via AWS S3 SDK v2 |
| Build | Maven |
| Utilities | Lombok, Jakarta Validation |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Component Library | Radix UI primitives + shadcn/ui |
| Animation | Framer Motion 12 |
| HTTP Client | Axios |
| WebSocket | @stomp/stompjs + SockJS |
| State Management | Zustand 5 |
| Forms | React Hook Form 7 + Zod 4 |
| Icons | Lucide React |

---

## Repository Structure

```
additi-final-project/
├── backend/                        # Spring Boot application
│   ├── src/main/java/groupproject/backend/
│   │   ├── BackendApplication.java
│   │   ├── config/                 # Security, JWT, WebSocket, R2, Jackson
│   │   ├── controller/             # REST + STOMP controllers (13 controllers)
│   │   ├── exception/              # Global exception handler
│   │   ├── model/                  # JPA entities
│   │   │   └── enums/              # Domain enumerations
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── request/                # Request DTOs
│   │   ├── response/               # Response DTOs
│   │   ├── service/                # Service interfaces
│   │   └── service/impl/           # Service implementations
│   ├── src/main/resources/
│   │   ├── application.properties  # Application configuration
│   │   └── data.sql                # Role seed data
│   ├── Dockerfile
│   └── pom.xml
│
└── frontend/                       # Next.js application
    ├── app/
    │   ├── (auth)/                 # Login & Registration pages
    │   ├── (dashboard)/            # Protected dashboard routes
    │   │   ├── admin/              # Admin panel pages
    │   │   ├── client/             # Client dashboard & projects
    │   │   ├── freelancer/         # Freelancer dashboard & projects
    │   │   ├── contracts/          # Contract detail pages
    │   │   ├── messages/           # Unified inbox
    │   │   ├── notifications/      # Notification center
    │   │   ├── post-project/       # Project creation
    │   │   └── settings/           # Profile settings
    │   └── (public)/               # Public-facing pages
    │       ├── explore/            # Browsable project board
    │       ├── community/          # Community page
    │       ├── insights/           # Platform insights
    │       ├── profile/            # Public user profiles
    │       └── projects/           # Public project detail pages
    ├── components/                 # Shared React components
    │   ├── ui/                     # shadcn/ui component primitives
    │   └── dashboard/              # Sidebar & topbar layout components
    ├── hooks/                      # Custom React hooks
    ├── lib/
    │   ├── api.ts                  # Typed Axios client + all API functions
    │   └── utils.ts                # Utility helpers
    ├── store/
    │   ├── auth.ts                 # Zustand auth store
    │   └── notifications.ts        # Zustand notification store
    └── public/                     # Static assets & brand images
```

---

## Architecture

### Backend Architecture

The backend follows a **layered architecture** with strict separation of concerns:

```
HTTP Request
     │
     ▼
┌─────────────────────────────────┐
│         JwtFilter               │  Extracts JWT from HttpOnly cookie,
│   (OncePerRequestFilter)        │  validates, and sets SecurityContext
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│       SecurityFilterChain       │  Route-level authorization rules
│    (Spring Security Config)     │  (public vs. authenticated vs. role-based)
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│         Controllers             │  REST endpoints; map requests to services
│  (13 controllers, @RestController)  delegate business logic downward
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│          Services               │  Business logic, transaction boundaries,
│   (interface + impl pattern)    │  notification dispatch, WebSocket push
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│        Repositories             │  Spring Data JPA; custom JPQL queries
│   (Spring Data JPA interfaces)  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│         PostgreSQL              │  Persistent data store
└─────────────────────────────────┘
```

**Key design decisions:**

- **Cookie-based JWT** — Access tokens and refresh tokens are stored in `HttpOnly` cookies (`SameSite=None; Secure` in production), making them inaccessible to JavaScript and immune to XSS token theft.
- **Stateless sessions** — `SessionCreationPolicy.STATELESS` is enforced. No server-side session is maintained.
- **Interface–implementation split** — Every service is defined as an interface and implemented separately, enabling clean dependency injection and testability.
- **`@EnableMethodSecurity`** — Method-level `@PreAuthorize` annotations supplement route-level CORS/auth rules for fine-grained access control.
- **Global exception handling** — `GlobalExceptionHandler` (`@ControllerAdvice`) catches validation errors, access denied exceptions, and runtime errors, returning uniform `ApiResponse<T>` JSON envelopes.
- **Standardised response envelope** — Every endpoint returns `ApiResponse<T>` with `success`, `message`, `data`, and `timestamp` fields.

---

### Frontend Architecture

The frontend uses Next.js 16 **App Router** with a route-group–based layout system:

```
app/
 ├── layout.tsx              Root layout (fonts, metadata, AuthInitializer)
 ├── icon.png                Auto-detected favicon (App Router file convention)
 ├── (public)/layout.tsx     Public layout with Navbar + Footer
 ├── (auth)/layout.tsx       Centered auth card layout
 └── (dashboard)/layout.tsx  Sidebar + topbar layout (requires authentication)
```

**Route groups** (`(auth)`, `(dashboard)`, `(public)`) share a layout without contributing a path segment. This allows completely different shell UIs per section with zero nesting overhead.

**`AuthInitializer`** is a client component mounted in the root layout. On first render it calls `/api/auth/me` to hydrate the Zustand auth store from the server-side cookie, giving every page instant access to the current user without prop drilling.

**`useRequireAuth(role?)`** is a client-side hook that checks the Zustand store and redirects unauthenticated or unauthorised users. It is called at the top of every protected page component.

---

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│  Login / Register                                                     │
│  POST /api/auth/login  →  Backend sets HttpOnly cookies:             │
│     accessToken  (short-lived, e.g. 15 min)                          │
│     refreshToken (long-lived, e.g. 7 days)                           │
└───────────────────────────────┬──────────────────────────────────────┘
                                │  Cookies automatically sent with every request
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  JwtFilter (per-request, server-side)                                 │
│  1. Read accessToken cookie                                           │
│  2. Validate JWT signature + expiry                                   │
│  3. Load UserDetails from DB                                          │
│  4. Set authentication in SecurityContext                             │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                  ┌─────────────▼──────────────┐
                  │   401 on expired token?     │
                  └─────────────┬──────────────┘
                                │  Axios response interceptor (api.ts)
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  POST /api/auth/refresh  →  Backend rotates both cookies              │
│  Queued requests are replayed after successful refresh                │
│  If refresh also fails → Zustand auth state is cleared, user logged out│
└──────────────────────────────────────────────────────────────────────┘
```

The Axios client in `lib/api.ts` uses a **debounced refresh queue**: concurrent 401 responses all wait on a single in-flight `/api/auth/refresh` call rather than firing multiple simultaneous refresh requests.

---

### Real-Time System

KhmerLance uses **STOMP over WebSocket** (with SockJS fallback) for two real-time features:

#### 1. Contract Chat

```
Client A (sender)
  │  STOMP PUBLISH
  │  /app/contracts/{id}/messages
  ▼
MessageController (@MessageMapping)
  │  Persists to DB
  │  SimpMessagingTemplate.convertAndSend(...)
  ▼
/topic/contracts/{id}/messages
  │
  ├──→  Client A (sender confirmation)
  └──→  Client B (receiver, live update)
```

#### 2. Push Notifications

When significant events occur (proposal accepted/rejected, contract completed, new message), `NotificationService` creates a `Notification` entity in the database **and** immediately pushes it via:

```
/topic/users/{userId}/notifications
```

The frontend hook `useNotificationSocket` (mounted in the dashboard layout) listens to this topic and updates the Zustand notification store, causing the `NotificationBell` in the topbar to increment its badge in real time.

#### 3. Typing Indicators

```
Client publishes:   /app/contracts/{id}/typing  →  { typing: true }
Server broadcasts:  /topic/contracts/{id}/typing  →  { userId, userName, typing }
```

`TypingController` validates the user is a party to the contract before broadcasting, preventing spoofed typing events.

#### WebSocket Authentication

The STOMP `CONNECT` frame carries the JWT cookie (forwarded by `WebSocketHandshakeInterceptor`). `WebSocketAuthChannelInterceptor` validates the token on the CONNECT frame and sets the Spring `Principal` on the session, so all subsequent `@MessageMapping` handlers have access to the authenticated user via `Principal`.

---

### File Storage

All user-uploaded files are stored on **Cloudflare R2** (S3-compatible object storage).

```
Client  →  POST /api/upload/avatar  (multipart/form-data)
           POST /api/upload/attachment
                    │
                    ▼
           UploadController
           → Validates content-type and file size
           → Delegates to R2StorageService
                    │
                    ▼
           R2StorageService
           → Generates UUID-based key: {folder}/{uuid}{ext}
           → Uploads via AWS SDK S3Client (pointed at R2 endpoint)
           → Returns public URL: {R2_PUBLIC_URL}/{key}
                    │
                    ▼
           URL saved to user.avatarUrl  OR  message.attachmentUrl
```

**Supported upload types:**
- Avatars: images only, max 5 MB, stored under `avatars/`
- Message attachments: images, PDF, Word, Excel, text, max 10 MB, stored under `attachments/`

---

## Domain Model

```
User ─────────────────────────────────────────────────────────────────
  │ id, name, email, password (BCrypt), bio, skills, avatarUrl
  │ isBanned, isOnline, lastSeenAt, notifEmail, notifPush, createdAt
  │
  ├── ManyToMany → Role  (CLIENT | FREELANCER | ADMIN)
  │
  ├── OneToMany → Project  (as client)
  │
  ├── OneToMany → Proposal  (as freelancer)
  │
  ├── OneToMany → Contract  (as client OR freelancer)
  │
  ├── OneToMany → Message  (as sender OR receiver)
  │
  ├── OneToMany → Review  (as reviewer OR reviewee)
  │
  └── OneToMany → Notification

Project ──────────────────────────────────────────────────────────────
  │ id, title, description, budgetMin, budgetMax, deadline, viewCount
  │ projectType (FIXED | HOURLY), experienceLevel (ENTRY | INTERMEDIATE | EXPERT)
  │ status (OPEN | IN_PROGRESS | COMPLETED | CANCELLED)
  │
  ├── ManyToOne → User (client)
  ├── ManyToOne → User (assignedFreelancer, nullable)
  └── ManyToOne → Category

Proposal ─────────────────────────────────────────────────────────────
  │ id, pitchText, offeredPrice, readByClient
  │ status (PENDING | ACCEPTED | REJECTED)
  │
  ├── ManyToOne → Project
  └── ManyToOne → User (freelancer)

Contract ─────────────────────────────────────────────────────────────
  │ id, agreedPrice, completedNote, startedAt, completedAt
  │ status (ACTIVE | COMPLETED | CANCELLED)
  │
  ├── ManyToOne → Project
  ├── ManyToOne → User (client)
  └── ManyToOne → User (freelancer)

Message ──────────────────────────────────────────────────────────────
  │ id, threadId, body, attachmentUrl, isRead, readAt, createdAt
  │
  ├── ManyToOne → Contract
  ├── ManyToOne → User (sender)
  └── ManyToOne → User (receiver)

Review ───────────────────────────────────────────────────────────────
  │ id, rating (1-5), comment, isPublic, reply, createdAt
  │
  ├── ManyToOne → Contract
  ├── ManyToOne → User (reviewer)
  └── ManyToOne → User (reviewee)

Notification ─────────────────────────────────────────────────────────
  │ id, type, title, body, referenceId, referenceType, isRead, readAt, createdAt
  │ referenceType (PROJECT | CONTRACT | PROPOSAL | MESSAGE | REVIEW)
  │
  └── ManyToOne → User (recipient)

Category ─────────────────────────────────────────────────────────────
  id, name
```

**Lifecycle state transitions:**

```
Project:   OPEN ──(proposal accepted)──→ IN_PROGRESS ──(contract completed)──→ COMPLETED
                                                     └──(manually)──→ CANCELLED

Proposal:  PENDING ──→ ACCEPTED  (triggers contract creation + project status change)
                  └──→ REJECTED

Contract:  ACTIVE ──→ COMPLETED
                 └──→ CANCELLED
```

---

## API Reference

All endpoints are prefixed with the backend base URL. Authenticated endpoints require the `accessToken` cookie.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Register a new user (`CLIENT` or `FREELANCER`) |
| `POST` | `/login` | Public | Login; sets `accessToken` + `refreshToken` cookies |
| `POST` | `/logout` | Public | Clears auth cookies |
| `POST` | `/refresh` | Public | Rotates both tokens using the refresh token cookie |
| `GET` | `/me` | Required | Returns the authenticated user's profile |
| `GET` | `/profile` | Required | Alias for `/me` |
| `PUT` | `/profile` | Required | Update name, email, password, bio, skills, avatar, notification prefs |

### Projects — `/api/projects`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | Paginated list of OPEN projects |
| `GET` | `/search` | Public | Search by keyword, category, budget range, status |
| `GET` | `/{id}` | Public | Project detail |
| `POST` | `/{id}/view` | Public | Increment view counter |
| `GET` | `/my` | CLIENT | Paginated list of the authenticated client's projects |
| `POST` | `/` | CLIENT | Create a new project |
| `PUT` | `/{id}` | CLIENT | Update own project |
| `DELETE` | `/{id}` | CLIENT | Delete own project |

### Proposals — `/api/projects/{id}/proposals` & `/api/proposals`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/projects/{id}/proposals` | FREELANCER | Submit a proposal |
| `GET` | `/api/projects/{id}/proposals` | CLIENT | List proposals for a project |
| `GET` | `/api/proposals/my` | FREELANCER | List the freelancer's own proposals |
| `PUT` | `/api/proposals/{id}/accept` | CLIENT | Accept proposal (creates contract) |
| `PUT` | `/api/proposals/{id}/reject` | CLIENT | Reject proposal |

### Contracts — `/api/contracts`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/my` | Required | List all contracts for the authenticated user |
| `GET` | `/{id}` | Required | Contract detail (only contract parties) |
| `PUT` | `/{id}/complete` | Required | Mark contract as completed |

### Messages — `/api/contracts/{id}/messages` & `/api/messages`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/contracts/{id}/messages` | Required | Paginated message history |
| `POST` | `/api/contracts/{id}/messages` | Required | Send a message (also pushes via WebSocket) |
| `PUT` | `/api/contracts/{id}/messages/read` | Required | Mark all messages in contract as read |
| `GET` | `/api/messages/unread-count` | Required | Total unread message count |
| `GET` | `/api/messages/conversations` | Required | Conversation list with last message preview |

### Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Required | Paginated notification list |
| `GET` | `/unread-count` | Required | Count of unread notifications |
| `PUT` | `/{id}/read` | Required | Mark a single notification as read |
| `PUT` | `/read-all` | Required | Mark all notifications as read |

### Reviews — `/api/contracts/{id}/review` & `/api/reviews` & `/api/users/{id}/reviews`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/contracts/{id}/review` | Required | Submit a review for a completed contract |
| `PUT` | `/api/reviews/{id}/reply` | Required | Add a reply to a review |
| `GET` | `/api/users/{id}/reviews` | Public | Get all public reviews for a user |

### Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/{id}/profile` | Public | Public user profile with average rating |
| `GET` | `/{id}/reviews` | Public | User's public reviews |

### Upload — `/api/upload`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/avatar` | Required | Upload profile avatar (image, max 5 MB) |
| `POST` | `/attachment` | Required | Upload message attachment (max 10 MB) |

### Admin — `/api/admin` _(ADMIN role required)_

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | List all users |
| `GET` | `/users/search` | Search users by name/email, role, ban status |
| `PUT` | `/users/{id}/ban` | Toggle user ban status |
| `GET` | `/projects` | Paginated project list with filters |
| `DELETE` | `/projects/{id}` | Force-delete any project |
| `GET` | `/categories` | List all categories |
| `POST` | `/categories` | Create a category |
| `PUT` | `/categories/{id}` | Rename a category |
| `DELETE` | `/categories/{id}` | Delete a category |
| `GET` | `/stats` | Platform-wide KPIs (users, projects, proposals, contracts) |

### Public Stats — `/api/stats`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | Platform-level statistics |

### WebSocket Topics (STOMP)

| Direction | Destination | Description |
|---|---|---|
| Publish | `/app/contracts/{id}/messages` | Send a chat message |
| Subscribe | `/topic/contracts/{id}/messages` | Receive new messages in a contract |
| Publish | `/app/contracts/{id}/typing` | Broadcast typing state |
| Subscribe | `/topic/contracts/{id}/typing` | Receive typing events |
| Subscribe | `/topic/users/{id}/notifications` | Receive real-time notifications |

---

## Frontend Pages & Routes

### Public Routes (`(public)` layout — Navbar + Footer)

| Route | Description |
|---|---|
| `/` | Landing page |
| `/explore` | Browsable & searchable project board |
| `/projects/[id]` | Public project detail with proposal submission |
| `/profile/[id]` | Public user profile with reviews and stats |
| `/community` | Community page |
| `/insights` | Platform insights |

### Auth Routes (`(auth)` layout — minimal centered card)

| Route | Description |
|---|---|
| `/login` | Login form |
| `/register` | Registration form with role selection |

### Dashboard Routes (`(dashboard)` layout — sidebar + topbar)

| Route | Role | Description |
|---|---|---|
| `/client/dashboard` | CLIENT | Overview: project stats + project/contract tabs |
| `/client/projects` | CLIENT | Full project list |
| `/client/projects/[id]` | CLIENT | Project management + proposal review |
| `/freelancer/dashboard` | FREELANCER | Overview: proposal stats + proposal/contract tabs |
| `/freelancer/projects` | FREELANCER | Browse all open projects |
| `/freelancer/projects/[id]` | FREELANCER | Project detail + proposal submission |
| `/post-project` | CLIENT | Create a new project |
| `/contracts/[id]` | Both | Contract detail + real-time chat + review |
| `/messages` | Both | Unified conversation inbox |
| `/notifications` | Both | Full notification history |
| `/settings` | Both | Profile, password, notification preference management |
| `/admin` | ADMIN | Dashboard with platform KPIs |
| `/admin/users` | ADMIN | User management with search, ban/unban |
| `/admin/projects` | ADMIN | Project moderation |
| `/admin/categories` | ADMIN | Category CRUD |

---

## State Management

KhmerLance uses **Zustand** for client-side global state. There are two stores:

### `useAuthStore` (`store/auth.ts`)

Manages the authenticated user session.

| State | Type | Description |
|---|---|---|
| `user` | `MeData \| null` | Current authenticated user |
| `loading` | `boolean` | True while the initial `/api/auth/me` call is in flight |
| `error` | `string \| null` | Last login/register error message |

**Derived helpers:** `isAuthenticated()`, `hasRole(role)`, `isClient()`, `isFreelancer()`, `isAdmin()`

**Actions:** `fetchUser()`, `login()`, `register()`, `logout()`, `clearError()`

### `useNotificationStore` (`store/notifications.ts`)

Manages notification badges and a real-time queue.

| State | Type | Description |
|---|---|---|
| `unreadCount` | `number` | Total unread notification count (shown in topbar bell) |
| `realtimeQueue` | `NotificationData[]` | Last 50 notifications received via WebSocket |

**Actions:** `setUnreadCount()`, `incrementUnread()`, `decrementUnread()`, `addNotification()`, `clearQueue()`

---

## Environment Variables

### Backend (set on Render or in `.env`)

| Variable | Required | Description |
|---|---|---|
| `DB_URL` | Yes | JDBC connection string, e.g. `jdbc:postgresql://host:5432/db` |
| `DB_USERNAME` | Yes | Database username |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | HS256 signing secret (min 32 chars) |
| `R2_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `R2_ACCESS_KEY` | Yes | R2 access key ID |
| `R2_SECRET_KEY` | Yes | R2 secret access key |
| `R2_BUCKET` | Yes | R2 bucket name |
| `R2_PUBLIC_URL` | Yes | Public base URL for the R2 bucket |
| `FRONTEND_URL` | Yes | Frontend origin for CORS, e.g. `https://khmerlance.site` |
| `COOKIE_SECURE` | Prod | Set to `true` in production |
| `COOKIE_SAME_SITE` | Prod | Set to `None` in production (cross-domain cookies) |

### Frontend (set on Vercel or in `.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend base URL, e.g. `https://your-app.onrender.com` |

---

## Local Development

### Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+

### Backend

```bash
cd backend

# Copy and fill in environment variables
cp .env.example .env   # (or set them in your shell)

# Run with Maven wrapper
./mvnw spring-boot:run
```

The API is available at `http://localhost:8080`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create local env file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# Start the development server
npm run dev
```

The frontend is available at `http://localhost:3000`.

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on Render pointing to the `backend/` directory.
2. Set build command: `./mvnw clean package -DskipTests`
3. Set start command: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
4. Configure all [backend environment variables](#backend-set-on-render-or-in-env) in the Render dashboard.
5. Attach a **Render PostgreSQL** instance and copy the `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` values.

### Frontend — Vercel

1. Import the repository into Vercel and set the **Root Directory** to `frontend/`.
2. Set the `NEXT_PUBLIC_API_URL` environment variable to your Render backend URL.
3. Add your custom domain (`khmerlance.site`) in Vercel's domain settings and point your DNS CNAME to `cname.vercel-dns.com`.

### Cross-Domain Cookie Configuration

Because the frontend (Vercel) and backend (Render) are on different domains, cookies must be configured for cross-origin use:

```
COOKIE_SECURE=true
COOKIE_SAME_SITE=None
```

These are set as environment variables on Render. The frontend origin (`https://khmerlance.site`) must be listed in `FRONTEND_URL` so the backend CORS policy allows the browser to send credentials.

---

## Licence

This project was developed as an academic capstone project at **ADDITI Academy**.
