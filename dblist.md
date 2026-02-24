# Databases to create

Use **postgres** / **toor** as username and password for all connections (for now).

| Database          | Service           | Purpose                    |
|-------------------|-------------------|----------------------------|
| `motori_keycloak` | Keycloak          | Keycloak auth server       |
| `motori_gateway`  | gateway           | Gateway logs               |
| `motori_users`    | user-service      | Users, auth, verification  |
| `motori_products` | product-service   | Products data              |
| `motori_backoffice` | backoffice-service | Backoffice data          |

## Create databases

Run the SQL script (as postgres user):

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

## Connection (current defaults)

- **Host:** localhost  
- **Port:** 5432  
- **User:** postgres  
- **Password:** toor  
