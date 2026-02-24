# Motori

Microservices stack: **Gateway**, **Discovery (Eureka)**, **user-service**, **product-service**, **backoffice-service**, **payment-service**, with **Keycloak** for auth and **MinIO** for object storage.

---

## Prerequisites

- **Java 25**
- **Maven** (or use each module’s `mvnw` / `mvnw.cmd`)
- **PostgreSQL** (local or Docker) — user `postgres`, password `toor`
- **Docker** (for Keycloak + MinIO via `docker compose`)

---

## 1. Create PostgreSQL databases

All services use the same DB user: **postgres** / **toor**.

Run once (from project root):

```bash
psql -U postgres -h localhost -f scripts/init-databases.sql
```

Or create manually:

```sql
CREATE DATABASE motori_keycloak;
CREATE DATABASE motori_gateway;
CREATE DATABASE motori_users;
CREATE DATABASE motori_products;
CREATE DATABASE motori_backoffice;
CREATE DATABASE motori_payments;
```

| Database           | Service            |
|--------------------|--------------------|
| `motori_keycloak`  | Keycloak           |
| `motori_gateway`   | gateway            |
| `motori_users`     | user-service       |
| `motori_products`  | product-service    |
| `motori_backoffice`| backoffice-service |
| `motori_payments`  | payment-service    |

More detail: [dblist.md](dblist.md).

---

## 2. Start infrastructure (Keycloak + MinIO)

Ensure **Docker** is running, then:

```bash
docker compose up -d
```

- **Keycloak:** http://localhost:8082 (admin / admin)
- **MinIO:** http://localhost:9090 (admin / supersecret), API on port 9002

Keycloak uses the database **motori_keycloak** at `host.docker.internal:5432` (PostgreSQL must be reachable from the host).

---

## 3. Configure Keycloak (realm + client + roles)

Either **import** an existing realm JSON or **configure from scratch**:

### Option A: Import a realm export

1. Open Keycloak Admin: http://localhost:8082
2. **Create realm** → **Browse** and select your `motori_realm-*.json` export.
3. Ensure the realm name is **`motori_realm`** and the client **user-service** exists with the correct client secret in your app config.

### Option B: Configure from scratch

1. Create realm **`motori_realm`**.
2. Create client **`user-service`** (Client authentication **ON**), copy the **Client secret**.
3. Create realm roles: **SUPERADMIN**, **ADMIN**, **USER**.
4. (Optional) Create a Super Admin user and assign **SUPERADMIN**.

Full steps and export instructions: [docs/keycloak-configure-and-export.md](docs/keycloak-configure-and-export.md).

**user-service** is preconfigured with a default client secret for local dev; for production set `KEYCLOAK_ADMIN_CLIENT_SECRET` and `KEYCLOAK_CREDENTIALS_SECRET`.

---

## 4. Start services (order matters)

Start in this order so discovery and gateway are up before the others:

| Order | Service         | Port | Command (from module dir)     |
|-------|-----------------|------|-------------------------------|
| 1     | **discovery**   | 8761 | `./mvnw spring-boot:run`      |
| 2     | **gateway**     | 8080 | `./mvnw spring-boot:run`      |
| 3     | **user-service** | 8081 | `./mvnw spring-boot:run`    |
| 4     | product-service | 8083 | `./mvnw spring-boot:run`      |
| 5     | backoffice-service | 8084 | `./mvnw spring-boot:run`  |
| 6     | payment-service | 8085 | `./mvnw spring-boot:run`      |

**Windows (PowerShell):** use `.\mvnw.cmd` instead of `./mvnw`.

- **Eureka dashboard:** http://localhost:8761  
- **Gateway (API entry):** http://localhost:8080 (routes use `lb://service-name`)

---

## 5. Ports summary

| Port  | Service / app           |
|-------|-------------------------|
| 8080  | gateway                 |
| 8081  | user-service            |
| 8082  | Keycloak                |
| 8083  | product-service         |
| 8084  | backoffice-service      |
| 8085  | payment-service         |
| 8761  | discovery (Eureka)      |
| 9002  | MinIO S3 API            |
| 9090  | MinIO web console       |

---

## 6. Environment variables (optional)

Override defaults via env or `application.properties`:

| Variable | Example | Used by |
|----------|---------|--------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/motori_users` | Any service with DB |
| `DB_USERNAME` | `postgres` | All DB services |
| `DB_PASSWORD` | `toor` | All DB services |
| `KEYCLOAK_ADMIN_CLIENT_SECRET` | *(from Keycloak)* | user-service |
| `KEYCLOAK_CREDENTIALS_SECRET` | *(same as above)* | user-service |
| `KEYCLOAK_ADMIN_REALM` | `motori_realm` | user-service |
| `GATEWAY_SERVICE_URL` | `http://localhost:8080` | user-service (logging) |

---

## 7. Testing the setup

1. **Discovery:** http://localhost:8761 — gateway and user-service (and others) should appear after they start.
2. **Keycloak:** http://localhost:8082 — log in as admin, check realm **motori_realm** and client **user-service**.
3. **Gateway:** e.g. http://localhost:8080/api/auth/… (routes depend on gateway config; auth goes to user-service via `lb://user-service`).
4. **user-service:** register/login endpoints under `/auth`; use tokens for protected endpoints.

---

## 8. Project layout

```
motori/
├── discovery/          # Eureka server (8761)
├── gateway/            # Spring Cloud Gateway (8080)
├── user-service/       # Auth, users (8081)
├── product-service/    # Products (8083)
├── backoffice-service/ # Backoffice (8084)
├── payment-service/    # Payments (8085)
├── docker-compose.yml  # Keycloak + MinIO
├── scripts/
│   └── init-databases.sql
├── docs/
│   └── keycloak-configure-and-export.md
├── dblist.md           # DB list and connection details
└── README.md           # This file
```

---

## 9. Troubleshooting

- **Eureka / “Post-processing of merged bean definition failed”:** Ensure the service has **spring-boot-starter-web** and Eureka client config (`eureka.client.service-url.defaultZone`, etc.). Start **discovery** first.
- **Keycloak “database not found”:** Create **motori_keycloak** and run `docker compose up -d` again. PostgreSQL must be reachable at `localhost:5432` from the host (Docker uses `host.docker.internal`).
- **DataSource / “url attribute not specified”:** Add DB and JPA settings to the service’s `application.properties` (see user-service or product-service for a template).
- **JWT / 401 on protected endpoints:** Check realm **motori_realm**, issuer URI, and that the client (e.g. user-service) has the correct secret and roles in Keycloak.
