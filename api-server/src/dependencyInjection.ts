import { BookResolvers } from "./book/bookResolver"
import { InMemoryBookStore } from "./book/bookStore"
import { GraphQLResolveInfo } from 'graphql';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoCache } from "./cache/cache";
import { CacheResolvers } from "./cache/cacheResolvers";


export function setUpDepedencies() {
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