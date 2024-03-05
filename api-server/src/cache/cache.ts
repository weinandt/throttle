import { Pool } from 'pg'
import { randomUUID } from 'node:crypto'

export interface Cache {
    get(key: string): Promise<[wasFound: boolean, value: string | null]>
    set(key: string, value: string): Promise<void>
}

export class PostgresCache implements Cache {
    private pool: Pool
    constructor({ pool }: {
        pool: Pool,
    }) {
        this.pool = pool
    }

    async get(key: string): Promise<[boolean, string | null]> {
        const result = await this.pool.query("select value from cache where key = $1", [key])
        if (result.rows.length == 0) {
            // Didn't find anything for that key.
            return [false, null]
        }

        return [true, result.rows[0].value]
    }

    async set(key: string, value: string): Promise<void> {
        const randomGuid = randomUUID().toString()
        await this.pool.query(`
            INSERT INTO cache (tenant_id, application_id, key, value)
            VALUES ($1, $2, $3, $4)
        `, [randomGuid, randomGuid, key, value])
    }
}