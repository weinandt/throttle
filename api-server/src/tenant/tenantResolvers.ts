import { RequestContext } from "../context";
import { Tenant, TenantGateway } from "./tenant";


export class TenantResolvers {
    private tenantGateway: TenantGateway

    constructor(config: {tenantGateway: TenantGateway}){
        this.tenantGateway = config.tenantGateway
    }

    async createTenant(_: any, __: any, context: RequestContext, ___: any): Promise<Tenant> {
        const tenant = await this.tenantGateway.createTenant()

        return tenant
    }
}