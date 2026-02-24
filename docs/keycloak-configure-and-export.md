# Keycloak: What to Configure Before Exporting the Realm

This guide lists the exact steps to configure Keycloak so it matches what the **Motori** apps expect. After that, you can export the realm and reuse it (e.g. in another environment).

**Assumptions:** Keycloak is running (e.g. `docker compose up -d`), admin console at `http://localhost:8082`, admin user `admin` / `admin`. PostgreSQL with database `motori_keycloak` is available.

---

## 1. Create the realm

1. Log in to the Keycloak Admin Console: **http://localhost:8082**
2. Hover the **master** dropdown (top-left) → **Create realm**.
3. **Realm name:** `motori_realm`
4. Click **Create**.

(If the realm already exists, select it and continue.)

---

## 2. Create the client `user-service`

1. In realm **motori_realm**, go to **Clients** → **Create client**.
2. **General settings**
   - **Client type:** OpenID Connect  
   - **Client ID:** `user-service`  
   - **Name:** (optional) e.g. `User Service`  
   - Next.
3. **Capability config**
   - **Client authentication:** **ON** (this is a confidential client).
   - **Authorization:** OFF (unless you use it later).
   - **Authentication flow:** keep **Standard flow** and **Direct access grants** enabled (for login and refresh).
   - Next.
4. **Login settings**
   - **Root URL:** (optional) e.g. `http://localhost:8081` for user-service.
   - **Valid redirect URIs:** add your frontend/auth callbacks (e.g. `http://localhost:5173/*`, `http://localhost:8081/*`).
   - **Valid post logout redirect URIs:** (optional) same as above.
   - **Web origins:** (optional) e.g. `http://localhost:5173`, `http://localhost:8081`.
   - Save.
5. Open the **Credentials** tab.
   - Copy the **Client secret** and set it in user-service (`KEYCLOAK_ADMIN_CLIENT_SECRET` and `KEYCLOAK_CREDENTIALS_SECRET`). The app is preconfigured with the secret for local dev.

---

## 3. Create realm roles

The app expects these **realm roles** (names must match; they are mapped to `ROLE_*` in the JWT).

1. Go to **Realm roles** → **Create role**.
2. Create these three roles (one by one):

| Role name   | Description (optional)     |
|-------------|----------------------------|
| `SUPERADMIN`| Full access, backoffice     |
| `ADMIN`     | Admin, can manage users     |
| `USER`      | Standard user               |

No need to assign them to the client; they are **realm roles** and will appear in the JWT under `realm_access.roles`.

---

## 4. (Optional) Create the first Super Admin user

If your app creates the super admin on startup (e.g. via `AdminInitializer`), you can skip this. Otherwise:

1. Go to **Users** → **Add user**.
2. **Username:** e.g. `superadmin` (or the email you use).
3. **Email:** e.g. `admin@motori.com` (match `email.superadmin.address` in user-service if needed).
4. **Email verified:** ON.
5. **First name / Last name:** as you like.
6. Create.
7. Open the user → **Credentials** → set a **Password** (temporary or permanent).
8. Open **Role mapping** → **Assign role** → choose **Filter by realm roles** → assign **SUPERADMIN**.

---

## 5. Client scope (optional)

- Default **client scopes** for the realm usually include `email`, `profile`, and roles. The app reads **email** (or `preferred_username`) and **realm_access.roles** / **resource_access.<clientId>.roles**.
- If you use custom claims, add them via **Client scopes** and assign to the client. For the basic setup above, defaults are enough.

---

## 6. Export the realm

Once the realm is configured:

1. In the left menu, open **Realm settings** (or stay in the realm).
2. Go to the **Action** dropdown (top-right) → **Partial export** or **Export**.
   - **Export groups and roles:** ON (to export realm roles).
   - **Export clients:** ON (to export `user-service` and its secret if you want it in the file).
   - **Export users:** ON if you want the super admin (and any test users) in the export.
3. Click **Export** and save the JSON file (e.g. `motori_realm-realm.json`).

**Security:** The exported file can contain client secrets and user credentials. Store it securely and do not commit it to version control unless it’s a template without real secrets.

---

## Checklist (quick reference)

- [ ] Realm **motori_realm** created.
- [ ] Client **user-service** created with **Client authentication** ON; client secret set in user-service (or via env vars).
- [ ] Realm roles created: **SUPERADMIN**, **ADMIN**, **USER**.
- [ ] (Optional) Super Admin user created and assigned **SUPERADMIN**.
- [ ] Realm exported (Partial/Full export) and JSON saved.

After that, you can re-import the realm elsewhere via **Create realm** → **Browse** and selecting the exported JSON, or via Keycloak CLI/API.
