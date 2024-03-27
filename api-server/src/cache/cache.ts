import { GetItemCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

export type CacheSetInput = {
    key: string
    value: string
    ttl?: Date
}

export type CacheLookUpResult = {
    wasFound: boolean
    value?: string
    ttl?: Date
}

export interface Cache {
    get(key: string): Promise<CacheLookUpResult>
    set(input: CacheSetInput): Promise<void>
}

export interface InMemoryMock {
    clear(): void // Clears everything store in memory
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

    async get(key: string): Promise<CacheLookUpResult> {
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
            return {
                wasFound: false
            }
        }

        const result: CacheLookUpResult = {
            wasFound: true,
        }

        const returnedTTL = response.Item[this.ttlKey]
        if (returnedTTL != null && returnedTTL.N != null) {
            const returnedTTLAsNumber = parseInt(returnedTTL.N, 10)
            if (isNaN(returnedTTLAsNumber)) {
                throw new Error('could not parse TTL for item' + returnedTTL)
            }

            // Dynamo stores this in seconds, but javascript Dates are milliseconds unix epoch.
            result.ttl = new Date(returnedTTLAsNumber * 1000)
        }

        const value = response.Item[this.valueKey]
        if (value.S == null) {
            throw new Error("Cached item was founds but did not have a value. Key Used: " + key)
        }

        result.value = value.S

        return result
    }

    async set(input: CacheSetInput): Promise<void> {
        const Item: any = {}
        Item[this.partitionKey] = input.key
        Item[this.valueKey] = input.value

        if (input.ttl != null) {
            Item[this.ttlKey] = Math.floor(input.ttl.getTime() / 1000.0)
        }
        
        // Put will completely overwrite the item.
        const command = new PutCommand({
            TableName: this.tableName,
            Item,
        });
        
        await this.dynamoClient.send(command)
    }
}

export class InMemoryCache implements Cache, InMemoryMock {
    private cache: Map<string, CacheLookUpResult> = new Map()

    async get(key: string): Promise<CacheLookUpResult> {
        const result: CacheLookUpResult = {
            wasFound: false,
        }

        const value = this.cache.get(key)
        if (value == null) {
            return result
        }

        result.wasFound = true
        result.ttl = value.ttl
        result.value = value.value

        return result
    }

    async set(input: CacheSetInput): Promise<void> {
        this.cache.set(input.key, {
            wasFound: true,
            value: input.value,
            ttl: input.ttl,
        })
    }
    
    clear() {
        this.cache.clear()
    }
}