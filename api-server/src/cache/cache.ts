import { GetItemCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Pool } from 'pg'

const tempGuidForEverything = 'dc182110-77a1-4ffe-a688-ad92dbd2f4e0'

export interface Cache {
    get(key: string): Promise<[wasFound: boolean, value: string | null]>
    set(key: string, value: string): Promise<void>
}

export class DynamoCache implements Cache {
    private dynamoClient: DynamoDBDocumentClient
    private tableName: string
    private partitionKey: string
    private valueKey = "value"

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
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: dynamoKey,
        })

        const response = await this.dynamoClient.send(command)
        if (response.Item == null) {
            return [false, null]
        }

        const value = response.Item[this.valueKey]
        if (value.S == null) {
            throw new Error("Cached item was found but did not have a value. Key Used: " + key)
        }

        return [true, value.S]
    }

    async set(key: string, value: string): Promise<void> {
        const Item: any = {}
        Item[this.partitionKey] = key
        Item['value'] = value
        const command = new PutCommand({
            TableName: this.tableName,
            Item,
        });
        
        await this.dynamoClient.send(command);
    }
}