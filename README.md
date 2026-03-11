# Express Trade Kit - E-Commerce Platform

A production-ready, lightning-fast e-commerce platform specially tailored for the Algerian market. Built with modern web technologies and featuring a highly polished "Dabang" unified admin dashboard, automated WhatsApp notifications, integrated local shipping (58 Wilayas), and robust backend stability.

## 🌟 Key Features

### 🛍️ Storefront
- Professional and performant product browsing and shopping cart experience.
- Mobile-first approach for responsive design across all devices.
- Seamless, race-condition free checkout process optimized for local Algerian purchasing behaviors.

### ⚙️ Admin Dashboard (Dabang Design System)
- **Unified Aesthetic**: Clean, modern, edge-to-edge UI leveraging soft shadows, rounded borders (`rounded-[14px]`/`[24px]`), and a cohesive color palette.
- **Advanced Management**: Manage Orders, Products, Customers, Categories, and Discounts effortlessly.
- **Bulk Operations**: Bulk delete and CSV exports for Orders, Customers, and Products.
- **Granular Settings**: Control appearance (Store Name, Custom Domain, Slideshows, Logos, Banners, Colors, Typography).
- **Integrations**: Connect Facebook Pixel API (CAPI) with Data Matching, and Green API for automated WhatsApp Notification routing.

### 🛡️ Production Capabilities
- **Race Condition Prevention**: Database transactions (`FOR UPDATE`) for atomic inventory and discount operations.
- **Centralized Logging**: Advanced server auditing via Winston and HTTP request mapping via Morgan (outputs to `/logs/application-%DATE%.log`).
- **Data Protection**: CRON-ready automated backup script (`backup.sh`) using PostgreSQL `pg_dump` with automatic cleanup of 7-day old archives.

## 🛠️ Technology Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI, React Router.
- **Backend**: Node.js, Express, PostgreSQL (node-pg), Winston, Middleware (Helmet, CORS validation).

## 🚀 Runbook & Setup Instructions

### 1. Prerequisites
- Node.js v18.x or above
- PostgreSQL 14 or above
- npm/yarn

### 2. Environment Variables

Create frontend `.env` and backend `server/.env` based on:
- [/.env.example](/root/express-trade-kit/.env.example)
- [/server/.env.example](/root/express-trade-kit/server/.env.example)

Example backend environment:
```env
PORT=3001
NODE_ENV=production
TRUST_PROXY=true

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=expresstrade
DB_USER=etk_user
DB_PASSWORD=change_me

JWT_SECRET=change_me_to_a_long_random_secret
CORS_ORIGINS=https://client-domain.com
```

### 3. Setup and Installation

**Install Frontend Dependencies:**
```sh
cd /root/express-trade-kit
npm install
```

**Install Backend Dependencies:**
```sh
cd /root/express-trade-kit/server
npm install
```

**Database Initialization:**
Import the initial schema:
```sh
psql -U root -d express_trade_kit -f server/src/db/init.sql
```

### 4. Running the Development Server

**Start Backend API (Terminal 1):**
```sh
cd /root/express-trade-kit/server
npm run dev
# The backend will start on port 3001
```

**Start Frontend Application (Terminal 2):**
```sh
cd /root/express-trade-kit
npm run dev
# Vite will serve the frontend on http://localhost:5173 or the next available port
```

### 4.1 Same-Domain Production Mode
This project is now prepared for the deployment pattern:
- `https://client-domain.com`
- `https://client-domain.com/api`

Recommended production setup:
- Build frontend assets with `npm run build`
- Serve `dist` behind `Caddy`
- Reverse proxy `/api` and `/uploads` to the backend on `127.0.0.1:3001`
- Keep PostgreSQL private and non-public

Reference files:
- [deploy/Caddyfile.example](/root/express-trade-kit/deploy/Caddyfile.example)
- [deploy/systemd/express-trade-kit-api.service](/root/express-trade-kit/deploy/systemd/express-trade-kit-api.service)
- [deploy/DEPLOYMENT_TEMPLATE_READINESS.md](/root/express-trade-kit/deploy/DEPLOYMENT_TEMPLATE_READINESS.md)

This structure is intended for future client-specific deployments from the same final project template.

### 4.2 Golden Image V1 (Staging / Client Trial)
The project now includes a first deployable template stack for real-world staging:
- [docker-compose.golden-image.yml](/root/express-trade-kit/docker-compose.golden-image.yml)
- [deploy/golden-image.env.example](/root/express-trade-kit/deploy/golden-image.env.example)
- [deploy/GOLDEN_IMAGE_V1_RUNBOOK.md](/root/express-trade-kit/deploy/GOLDEN_IMAGE_V1_RUNBOOK.md)
- [deploy/GOLDEN_IMAGE_V1_AUDIT.md](/root/express-trade-kit/deploy/GOLDEN_IMAGE_V1_AUDIT.md)

Recommended flow:
1. Point the client domain to the server
2. Copy `deploy/golden-image.env.example` to `.env.golden`
3. Set domain, database password, JWT secret, and optional integration secrets
4. Run:
```sh
docker compose --env-file .env.golden -f docker-compose.golden-image.yml up -d --build
```
5. Complete first-run admin setup at `/admin/setup`

### 4.3 Registry-Based Golden Image Release
For client-ready releases that should be installed on any server without rebuilding from source, use:
- [docker-compose.golden-image.registry.yml](/root/express-trade-kit/docker-compose.golden-image.registry.yml)
- [deploy/golden-image.registry.env.example](/root/express-trade-kit/deploy/golden-image.registry.env.example)
- [deploy/GOLDEN_IMAGE_V1_REGISTRY_RUNBOOK.md](/root/express-trade-kit/deploy/GOLDEN_IMAGE_V1_REGISTRY_RUNBOOK.md)

This flow is the proper release path for:
- building versioned Docker images
- pushing them to a registry
- pulling them on a client server
- enabling SSL automatically on the client domain

### 5. Automated Backups & System Maintenance
For production data safety, schedule the provided db dumping script via CRON tasks.
1. Allow execution: `chmod +x server/backup.sh`
2. Schedule a daily 3 AM backup by adding to `crontab -e`:
   `0 3 * * * /root/express-trade-kit/server/backup.sh >> /var/log/pg_backup.log 2>&1`

### 6. Development Notes & Troubleshooting
- Ensure `logs` directory within `server` is a valid directory to prevent backend crashes (Winston requirement).
- When modifying layout width limits in the Admin Panel, follow the established Dabang form spacing guidelines and ensure `max-w` alignments strictly match UI components.
- In local development, `/api` and `/uploads` are proxied by Vite to `http://localhost:3001`.

## 📝 Documentations included
Please refer to `production_readiness_audit.md` and `production_upgrade_plan.md` in this repository for a detailed history of the production maturity plan executed.
