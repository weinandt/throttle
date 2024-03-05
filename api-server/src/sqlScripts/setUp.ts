import { readFileSync } from "node:fs"
import {Pool} from 'pg'

const poolConfig = {
    connectionString: 'postgres://postgres:postgres@localhost:5432',
    max: 15,
    allowExitOnIdle: true,
}
const pool = new Pool(poolConfig);

(async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE IF NOT EXISTS cache (
                tenant_id uuid NOT NULL,
                application_id uuid NOT NULL,
                key VARCHAR(100),
                value VARCHAR(10000)
            );
    `)
    } catch (e) {
        console.error('problem with set up', e)
    }
})();