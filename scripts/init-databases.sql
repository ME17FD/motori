-- Create databases for Motori (run as postgres user)
-- Usage: psql -U postgres -h localhost -f scripts/init-databases.sql

CREATE DATABASE motori_keycloak;
CREATE DATABASE motori_gateway;
CREATE DATABASE motori_users;
CREATE DATABASE motori_products;
CREATE DATABASE motori_backoffice;
CREATE DATABASE motori_payments;
