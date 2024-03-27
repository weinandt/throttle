import { GraphQLResolveInfo } from 'graphql';
import { Pool } from 'pg'
import { CacheResolvers } from "./cache/cacheResolvers";
import { DynamoCache, Cache } from './cache/cache';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PostgresTenantGateway } from './tenant/tenant';
import { TenantResolvers } from './tenant/tenantResolvers';
import { DateTimeResolver, VoidResolver } from 'graphql-scalars'

export type Overrides = {
    cache?: Cache
}

export type Resolvers = ReturnType<typeof setUpDepedencies>

export function setUpDepedencies(overrides?: Overrides) {
    const poolConfig = {
        connectionString: 'postgres://postgres:postgres@localhost:5432',
        max: 15,
        allowExitOnIdle: true,
    }
    const pool = new Pool(poolConfig)
    const tenantGateway = new PostgresTenantGateway({ pool })
    const tenantResolvers = new TenantResolvers({ tenantGateway })

    // Cache.
    const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    const cache: Cache = overrides?.cache ?? new DynamoCache({
        dynamoClient: docClient,
        tableName: "test",
        partitionKey: "my-parition-key"
    })

    const cacheResolvers = new CacheResolvers(cache)

    return {
        DateTime: DateTimeResolver,
        Void: VoidResolver,
        Query: {
            get: (parent: any, args: any, context: any, info: GraphQLResolveInfo) => cacheResolvers.get(parent, args, context, info),
        },
        Mutation: {
            set: (parent: any, args: any, context: any, info: GraphQLResolveInfo) => cacheResolvers.set(parent, args, context, info),
            createTenant: (parent: any, args: any, context: any, info: GraphQLResolveInfo) => tenantResolvers.createTenant(parent, args, context, info)
        }
    }
}