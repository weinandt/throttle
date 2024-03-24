import { GetItemCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { ArgumentError } from '../error/error'

export interface Cache {
    get(key: string): Promise<[wasFound: boolean, value: string | null]>
    set(key: string, value: string, ttl: number | null): Promise<void>
}

export class DynamoCache implements Cache {
    private dynamoClient: DynamoDBDocumentClient
    private tableName: string
    private partitionKey: string
    private valueKey = "value"
    private ttlKey = 'expirationTime'

    constructor({dynamoClient, tableName, partitionKey}: {
        dynamoClient: DynamoDBDocumentClient,
        tableName: string
        partitionKey: string
    }) {
        this.dynamoClient = dynamoClient
        this.tableName = tableName
        this.partitionKey = partitionKey
    }

    async get(key: string): Promise<[boolean, string | null]> {
        const dynamoKey: any = {}
        dynamoKey[this.partitionKey] = {
            S: key
        }

        // Strongly Consistent Reads by default.
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: dynamoKey,
            ConsistentRead: true,
        })

        const response = await this.dynamoClient.send(command)
        if (response.Item == null) {
            return [false, null]
        }

        // Checking TTL. If expired, returning null.
        // Dynamo (nor any other cache) can auto evict everything when it expires.
        // Implementing this type of check is required.
        // A dynamo query with filter could also be used.
        const returnedTTL = response.Item[this.ttlKey]
        if (returnedTTL != null && returnedTTL.N != null) {
            const returnedTTLAsNumber = parseInt(returnedTTL.N, 10)
            if (isNaN(returnedTTLAsNumber)) {
                throw new Error('could not parse TTL for item' + returnedTTL)
            }

            const currentTime = Math.floor(new Date().getTime() / 1000)
            if (returnedTTLAsNumber < currentTime) {
                return [false, null]
            }
        }

        const value = response.Item[this.valueKey]
        if (value.S == null) {
            throw new Error("Cached item was founds but did not have a value. Key Used: " + key)
        }

        return [true, value.S]
    }

    async set(key: string, value: string, ttl: number | null): Promise<void> {
        const Item: any = {}
        Item[this.partitionKey] = key
        Item[this.valueKey] = value

        if (ttl != null) {
            // TODO: make this a graphql scalar.
            const isValidDate = !isNaN(Date.parse(new Date(ttl).toString()))
            if(!isValidDate) {
                throw new ArgumentError('TTL Date was not valid' + ttl)
            }
        
            Item[this.ttlKey] = ttl
        }
        
        // Put will completely overwrite the item.
        const command = new PutCommand({
            TableName: this.tableName,
            Item,
        });
        
        await this.dynamoClient.send(command);
    }
}