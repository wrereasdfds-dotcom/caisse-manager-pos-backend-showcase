# Caisse Manager POS Backend Showcase

Production-style **Node.js / Express / Socket.IO backend** designed around a multi-store POS SaaS platform: cash register, waiter app, kitchen display system, back-office, delivery integrations, payments, stock and reporting.

> Status: personal technical showcase built to demonstrate backend architecture skills for a Senior Backend Engineer role. It is not an official Caisse Manager repository.

## Why this project exists

The goal is to show that I can design and build the backend core of a POS SaaS platform that connects:

- POS terminals
- waiter mobile applications
- kitchen display systems (KDS)
- back-office dashboards
- stock management
- payment callbacks
- delivery integrations such as Glovo / Yassir / Done
- multi-store and multi-tenant operations

## Main features

- REST API built with **Node.js, Express.js and TypeScript**
- Real-time order flow with **Socket.IO**
- Multi-tenant / multi-store architecture
- SQL data model with **PostgreSQL + Prisma**
- Event/audit storage with **MongoDB + Mongoose**
- Background jobs with **Redis + Bull**
- Docker and Docker Compose setup
- JWT authentication and tenant scoping
- POS order creation and KDS order status updates
- Payment capture simulation and invoice queue
- Delivery webhook integration structure
- Stock decrement and low-stock alerts
- API validation with Zod
- GitHub Actions CI workflow
- Technical documentation and API contract

## Architecture overview

```text
POS / Waiter App / Back-office
          |
          v
   Express REST API  <---->  Socket.IO realtime layer
          |
          |---- PostgreSQL / Prisma: tenants, stores, users, products, orders, payments, stock
          |---- MongoDB / Mongoose: order events, webhook logs, audit trail
          |---- Redis / Bull: receipt printing, invoice sync, async processing
          |
          v
 KDS screens, printers, payment providers, delivery platforms
```

## Tech stack

| Area | Stack |
|---|---|
| Runtime | Node.js 20 |
| API | Express.js + TypeScript |
| Realtime | Socket.IO |
| SQL database | PostgreSQL + Prisma |
| NoSQL events | MongoDB + Mongoose |
| Queues | Redis + Bull |
| Auth | JWT |
| Validation | Zod |
| Deployment | Docker + Docker Compose |
| CI | GitHub Actions |

## Quick start

```bash
cp .env.example .env
npm install
npm run prisma:generate
docker compose up -d postgres mongo redis
npm run prisma:migrate
npm run seed
npm run dev
```

API runs on:

```text
http://localhost:4000/api/v1
```

Demo login after seed:

```json
{
  "email": "owner@demo.ma",
  "password": "Demo12345!"
}
```

## Main endpoints

### Auth

```http
POST /api/v1/auth/login
```

### Stores

```http
GET /api/v1/stores
GET /api/v1/stores/:storeId/dashboard
```

### Orders

```http
GET /api/v1/orders?storeId=demo-store-rabat-hay-riad
POST /api/v1/orders
PATCH /api/v1/orders/:orderId/status
POST /api/v1/orders/:orderId/payments/capture
```

### Inventory

```http
GET /api/v1/inventory/stores/:storeId/low-stock
POST /api/v1/inventory/stores/:storeId/adjustments
```

### Integrations

```http
POST /api/v1/integrations/delivery/orders
POST /api/v1/integrations/payments/cmi/callback
```

## Example order payload

```json
{
  "storeId": "demo-store-rabat-hay-riad",
  "tableNumber": "T12",
  "channel": "WAITER_APP",
  "items": [
    {
      "productId": "PRODUCT_ID_FROM_DB",
      "quantity": 2,
      "notes": "No onions"
    }
  ]
}
```

When an order is created:

1. The API validates the payload.
2. Tenant and store scope are checked.
3. Order and order items are stored in PostgreSQL.
4. Stock is decremented transactionally.
5. An audit event is written to MongoDB.
6. A receipt printing job is added to Redis/Bull.
7. Socket.IO emits an update to the store KDS/back-office room.

## Realtime rooms

A KDS, POS or back-office client joins:

```ts
socket.emit('store:join', { storeId: 'demo-store-rabat-hay-riad' });
```

Then it receives:

```ts
socket.on('order:update', (payload) => {
  console.log(payload.orderId, payload.status);
});
```

## Why this matches a POS SaaS backend

This project is intentionally focused on real backend problems in restaurant/retail POS systems:

- fast order creation
- realtime kitchen updates
- multi-store dashboards
- stock accuracy
- payment callbacks
- delivery order webhooks
- queue-based receipt/invoice processing
- tenant isolation
- deployment readiness

## Repository structure

```text
src/
  app.ts
  server.ts
  worker.ts
  config/
  infrastructure/
  realtime/
  queues/
  models/
  features/
    auth/
    tenants/
    stores/
    orders/
    inventory/
    integrations/
    health/
prisma/
  schema.prisma
  seed.ts
docs/
  ARCHITECTURE.md
  API_CONTRACT.md
  SCALABILITY_NOTES.md
  SECURITY_NOTES.md
postman/
  caisse-manager-pos-backend.postman_collection.json
.github/workflows/
  ci.yml
```

## Author

Achraf Karzit  
Backend / SaaS / POS Systems Technical Showcase
