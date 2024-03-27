import { query } from "express";

/**
 * In memory implementations used by the unit tests should implement this.
 */
export interface InMemoryMock {
    clear(): void // Clears everything store in memory
}

export class GraphQLClient {
    private port: number
    constructor(port: number) {
        this.port = port
    }

    async request(queryString: string): Promise<any> {
        const query = { query: queryString }

        const response = await fetch(`http://localhost:${this.port}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        })
        
        const responseJson = await response.json()

        return responseJson
    }
}