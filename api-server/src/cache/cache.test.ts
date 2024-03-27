import http from "node:http"
import { ServerConfig, startServer } from "../server";
import assert from "node:assert";
import { Overrides, setUpDepedencies } from "../dependencyInjection";
import { InMemoryCache } from "./cache";
import { GraphQLClient, InMemoryMock } from "../test/utilties";

describe('Cache Integration Tests', function () {
    const inMemoryCache = new InMemoryCache()
    const inMemoryImplementations: InMemoryMock[] = [
        inMemoryCache,
    ]

    const overrides: Overrides = {
        cache: inMemoryCache
    }
    const resolvers = setUpDepedencies(overrides)
    const serverConfig: ServerConfig = {
        port: 3000,
        resolvers,
    }
    let server: http.Server
    const client = new GraphQLClient(3000)
    before(async () => {

        server = await startServer(serverConfig)
    });

    after(async function () {
        const serverShutDownPromise: Promise<void> = new Promise(resolve => {
            server.close(err => {
                resolve()
            })
        })

        await serverShutDownPromise
    });

    beforeEach(function () {
        // Clear all in memory implementations so tests don't take dependency on each other.
        inMemoryImplementations.forEach(x => x.clear())
    });

    it('Item not in the cache should return not found', async () => {
        const query = `
            {
                get(key: "doesNotExist") {
                    wasFound
                }
            }
          `
        const result = await client.request(query)

        assert.equal(result.data.get.wasFound, false)
    })

    it('Set Item Should Be Returned', async () => {
        const key = 'testkey'
        const value = 'testvalue'
        const mutation = `
                mutation {
                    set(input: {
                    key: "${key}"
                    value: "${value}"
                    })
                }
        `

        await client.request(mutation)

        const query = `
                {
                    get(key: "${key}") {
                        wasFound
                        value
                    }
                }
            `
        
        const queryResponse = await client.request(query)
        
        assert.deepEqual(queryResponse.data.get, {
            wasFound: true,
            value: value
        })
    })

    // TODO: test for setting then getting

    // TODO: test for ttl

    // TODO: test for changing from ttl to not ttl.
});