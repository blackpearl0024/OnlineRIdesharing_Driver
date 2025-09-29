
# Online Ride-Sharing — Driver App

**Online Ride-Sharing (Driver)** — a full‑stack prototype for drivers built with **Next.js (frontend)** and **Java (backend)**.  
Focus: realistic ride management experience with map-based route tracking, traffic simulation, wallet/payment verification, vehicle verification, and driver-specific UI.

> **Tech highlight:** Next.js + Leaflet map, OSRM routing server, Clerk for auth, Photon geocoding, Razorpay test + in-app wallet, MongoDB for persistence, Java (Spring Boot) backend APIs.

---

## Table of Contents
- [Live features](#live-features)
- [Architecture](#architecture)
- [Getting started (dev)](#getting-started-dev)
  - [Prerequisites](#prerequisites)
  - [OSRM server (routing)](#osrm-server-routing)
  - [Frontend (Next.js)](#frontend-nextjs)
  - [Backend (Java / Spring Boot)](#backend-java--spring-boot)
- [Environment variables (examples)](#environment-variables-examples)
- [How features work (quick)](#how-features-work-quick)
- [Testing payments / Wallet flow](#testing-payments--wallet-flow)
- [Common commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License & credits](#license--credits)
- [Contact](#contact)

---

## Live features
- Driver sign up / sign in using **Clerk** (passwordless or email/password flows).
- **Vehicle verification** before starting to accept rides (upload documents / images for approval).
- Interactive **Leaflet** map for tracking rides and routes.
- **Route optimization** using **OSRM** server.
- Show **alternate routes** and highlight estimated ETA.
- **Traffic simulation** to visualize vehicles on map.
- **Photon API** to convert address strings → latitude/longitude.
- **Razorpay** test integration for wallet/payment verification.
- **MongoDB** stores users, vehicles, rides, and payment history.
- Java (Spring Boot) backend exposing REST APIs consumed by the Next.js frontend.
- Driver-specific UI: dashboard with ride requests, accepted rides, ride history, and wallet balance.

---

## Architecture
```

[Next.js Frontend]  <--->  [Spring Boot Backend (REST APIs)]  <--->  [MongoDB]
|
+--> OSRM routing server (HTTP)
|
+--> Photon Geocoding API (HTTP)
|
+--> Clerk (Auth)
|
+--> Razorpay (test)  (payments)  + Wallet simulation in backend

````

---

## Getting started (dev)

### Prerequisites
- Node.js (>=16) and npm/yarn
- Java 11+ / Maven (for backend)
- MongoDB (local or cloud Atlas)
- OSRM routing server
- Clerk account
- Razorpay test account
- Photon geocoding (public API or self-hosted)

---

### OSRM server (routing)
Follow the same instructions as Rider app. Use `alternatives=true` for multiple routes.

---

### Frontend (Next.js)
1. Clone repo & go to frontend:
   ```bash
   git clone https://github.com/your-org/OnlineRIdesharing_Driver.git
   cd OnlineRIdesharing_Driver/frontend
````

2. Install dependencies:

   ```bash
   npm install
   ```

3. `.env.local` — create and add variables (see example below).

4. Run dev server:

   ```bash
   npm run dev
   ```

**Driver-specific UI**:

* Ride request dashboard
* Vehicle verification form
* Accepted rides tracking
* Ride history
* Wallet balance and transaction verification

---

### Backend (Java / Spring Boot)

1. Go to backend:

   ```bash
   cd ../backend
   ```

2. Configure `application.properties`.

3. Run:

   ```bash
   ./mvnw spring-boot:run
   ```

Backend endpoints examples:

* `POST /api/vehicles/verify` — submit vehicle documents for approval
* `GET /api/rides/requests` — get available ride requests
* `POST /api/rides/accept` — accept a ride
* `POST /api/payments/verify` — verify payment/credit
* `GET /api/rides/history` — ride history for driver

---

## Environment variables (examples)

### Frontend `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_OSRM_URL=http://localhost:5000
NEXT_PUBLIC_PHOTON_URL=https://photon.komoot.io
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=clerk_pk_...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
NEXT_PUBLIC_APP_NAME=OnlineRideSharingDriver
```

### Backend `application.properties`

```
MONGODB_URI=mongodb://localhost:27017/onlineridesharing
CLERK_API_KEY=clerk_sk_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=rzp_test_secret
OSRM_BASE_URL=http://localhost:5000
PHOTON_BASE_URL=https://photon.komoot.io
JWT_SECRET=some_secure_secret
SERVER_PORT=8080
```

---

## How features work (quick)

* **Vehicle verification**: driver submits documents, backend marks verified status.
* **Ride requests**: drivers see nearby ride requests, accept rides.
* **Routing & Traffic**: same OSRM + traffic simulation as Rider app.
* **Wallet / payments**: test payments via Razorpay or in-app wallet simulation.
* **Clerk auth**: driver authentication and session verification.
* **Dashboard**: driver UI shows assigned rides, status, and wallet.

---

## Testing payments / Wallet flow

Same as Rider app: Razorpay test keys or backend wallet simulation.

---

## Common commands

* Frontend: `npm run dev`
* Backend: `./mvnw spring-boot:run`
* MongoDB: `mongod`

---

## Troubleshooting

* Vehicle verification not updating → check backend API and MongoDB.
* Ride requests not showing → ensure CORS and backend running.
* OSRM/Photon errors → ensure endpoints reachable.

---

## Contributing

* Fork repo → feature branch → PR → code review.

---

## License & credits

* Open-source components: Next.js, Leaflet, OSRM, Photon, Clerk, Razorpay, MongoDB.
* Recommended license: MIT.

---

## Contact

Open an issue in the repository for questions or suggestions.

