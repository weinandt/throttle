import { Pool } from 'pg'

export type Tenant = {
    tenantId: string
}

export interface TenantGateway {
    createTenant(): Promise<Tenant>
}

export class PostgresTenantGateway implements TenantGateway {
    private pool: Pool
    constructor({ pool }: {
        pool: Pool,
    }) {
        this.pool = pool
    }

    async createTenant(): Promise<Tenant> {
        try {
            const result = await this.pool.query('INSERT INTO tenants DEFAULT VALUES returning id;')

            return {
                tenantId: result.rows[0].id
            }
        } catch(err) {
            console.error('Problem creating tenant', err)

            throw err
        }
    }
}