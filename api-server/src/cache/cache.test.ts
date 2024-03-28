import http from "node:http"
import { ServerConfig, startServer } from "../server";
import assert from "node:assert";
import { Overrides, setUpDepedencies } from "../dependencyInjection";
import { CacheLookUpResult, CacheSetInput, InMemoryCache } from "./cache";
import { GraphQLClient, InMemoryMock } from "../test/utilties";

const client = new GraphQLClient(3000)

async function setCache(input: CacheSetInput): Promise<void> {
        let ttlString = ''
        if (input.ttl != null) {
            ttlString = `ttl: ${input.ttl}`
        }
        const mutation = `
                mutation {
                    set(input: {
                    key: "${input.key}"
                    value: "${input.value}"
                    ${ttlString}
                    })
                }
        `

        await client.request(mutation)
}

async function getCache(key: string): Promise<CacheLookUpResult> {
    // TODO: change this query to take arguments instead of hardcoding.
    const query = `
            {
                get(key: "${key}") {
                    wasFound
                    value
                    ttl
                }
            }
          `
        const result = (await client.request(query)).data.get

        return {
            ttl: result.ttl,
            wasFound: result.wasFound,
            value: result.value
        }
}

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
        const result = await getCache('not in cache')        

        assert.equal(result.wasFound, false)
    })

    it('Set Item Should Be Returned', async () => {
        const key = 'testkey'
        const value = 'testvalue'
        
        await setCache({
            key,
            value,
        })

        const response = await getCache(key)
        assert.deepEqual(response, {
            wasFound: true,
            value: value,
            ttl: null,
        })
    })

    // TODO: test for setting then getting

    // TODO: test for ttl

    // TODO: test for changing from ttl to not ttl.
});