import {Pool} from 'pg'

// Queries for set up.
// Extensions
const uuidExtension = `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

// Tables
const cacheTable = `
    CREATE TABLE IF NOT EXISTS cache (
        tenant_id uuid NOT NULL,
        application_id uuid NOT NULL,
        key VARCHAR(100),
        value VARCHAR(10000),
        PRIMARY KEY (tenant_id, application_id, key)
    );
`
// List of queries to execute sequentially.
const queryList = [
    uuidExtension,
    cacheTable,
]

const poolConfig = {
    connectionString: 'postgres://postgres:postgres@localhost:5432',
    max: 15,
    allowExitOnIdle: true,
}
const pool = new Pool(poolConfig);

(async () => {
    try {
        for (const query of queryList) {
            await pool.query(query)
        }
    } catch (e) {
        console.error('problem with set up', e)
    }
})();