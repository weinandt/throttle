CREATE EXTENSION "uuid-ossp";

CREATE TABLE IF NOT EXISTS cache (
    tenant_id uuid NOT NULL,
    application_id uuid NOT NULL,
    key VARCHAR(100),
    value VARCHAR(10000)
);