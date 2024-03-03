import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export interface Cache {
    get(key: string): Promise<[wasFound: boolean, value: string]>
    set(key: string, value: string): Promise<void>
}

export class DynamoCache implements Cache {
    private dynamoClient: DynamoDBDocumentClient
    constructor(dynamoClient: DynamoDBDocumentClient) {
        this.dynamoClient = dynamoClient
    }

    async get(key: string): Promise<[boolean, string]> {
        return [true, "testval"]
    }

    async set(key: string, value: string): Promise<void> {

    }
}