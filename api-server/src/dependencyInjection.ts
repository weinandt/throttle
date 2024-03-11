import { GraphQLResolveInfo } from 'graphql';
import {Pool} from 'pg'
import { CacheResolvers } from "./cache/cacheResolvers";
import { DynamoCache, PostgresCache } from './cache/cache';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export function setUpDepedencies() {
    const poolConfig = {
        connectionString: 'postgres://postgres:postgres@localhost:5432',
        max: 15,
        allowExitOnIdle: true,
    }

    // Will use postgres for tenancy information. But is not currently used for the cache.
    const pool = new Pool(poolConfig)
    
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    const cache = new DynamoCache({
        dynamoClient: docClient,
        tableName: "test",
        partitionKey: "my-parition-key"
    })
    const cacheResolvers = new CacheResolvers(cache)

    
    return {
        Query: {
           get:(parent: any, args: any, context: any, info: GraphQLResolveInfo) => cacheResolvers.get(parent, args, context, info),
        },
        Mutation: {
            set: (parent: any, args: any, context: any, info: GraphQLResolveInfo) => cacheResolvers.set(parent, args, context, info)
        }
    }
}