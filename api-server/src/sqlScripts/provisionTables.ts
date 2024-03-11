import {Pool} from 'pg'
import { readFileSync } from "node:fs"
import path from "node:path"

async function ExecuteScriptsInOrder(pool: Pool, scriptNames: string[]): Promise<void> {
    for (const scriptName of scriptNames) {
        const sqlQuery = readFileSync(path.join(__dirname, scriptName)).toString()
        await pool.query(sqlQuery)
    }
}

(async () => {
    try {
        const poolConfig = {
            connectionString: 'postgres://postgres:postgres@localhost:5432',
            max: 15,
            allowExitOnIdle: true,
        }
        const pool = new Pool(poolConfig);
        const scriptPaths = [
            'tenantTable.sql'
        ]

        await ExecuteScriptsInOrder(pool, scriptPaths)
    } catch (e) {
        console.error('problem with set up', e)
    }
})()