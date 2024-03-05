import { Pool } from 'pg'

export interface Cache {
    get(key: string): Promise<[wasFound: boolean, value: string | null]>
    set(key: string, value: string): Promise<void>
}

export class PostgresCache implements Cache {
    private pool: Pool
    constructor({pool}: {
        pool: Pool,
    }) {
        this.pool = pool
    }

    async get(key: string): Promise<[boolean, string | null]> {
        return [true, "test"]
    }

    async set(key: string, value: string): Promise<void> {

    }
}