import { GraphQLResolveInfo } from 'graphql';
import {Pool} from 'pg'
import { CacheResolvers } from "./cache/cacheResolvers";
import { PostgresCache } from './cache/cache';

export function setUpDepedencies() {
    const poolConfig = {
        connectionString: 'postgres://postgres:postgres@localhost:5432',
        max: 100,
        allowExitOnIdle: true,
    }
    const pool = new Pool(poolConfig)
    const postgresCache = new PostgresCache({pool})
    const cacheResolvers = new CacheResolvers(postgresCache)

    return {
        Query: {
           get:(parent: any, args: any, context: any, info: GraphQLResolveInfo) => cacheResolvers.get(parent, args, context, info),
        },
        Mutation: {
            set: (parent: any, args: any, context: any, info: GraphQLResolveInfo) => cacheResolvers.set(parent, args, context, info)
        }
    }
}