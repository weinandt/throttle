import { Pool } from 'pg'

const tempGuidForEverything = 'dc182110-77a1-4ffe-a688-ad92dbd2f4e0'

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
        const query = `
            SELECT value FROM cache
                WHERE tenant_id = $1
                    AND application_id = $2
                    AND key = $3
        `
        const result = await this.pool.query(query, [tempGuidForEverything, tempGuidForEverything, key])
        if (result.rows.length == 0) {
            // Didn't find anything for that key.
            return [false, null]
        }

        return [true, result.rows[0].value]
    }

    async set(key: string, value: string): Promise<void> {
        await this.pool.query(`
            INSERT INTO cache (tenant_id, application_id, key, value)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (tenant_id, application_id, key) DO UPDATE
                SET value = $4;
        `, [tempGuidForEverything, tempGuidForEverything, key, value])
    }
}