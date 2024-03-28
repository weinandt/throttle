import http from "node:http"
import { ServerConfig, startServer } from "../server";
import assert from "node:assert";
import { Overrides, setUpDepedencies } from "../dependencyInjection";
import { CacheLookUpResult, CacheSetInput, InMemoryCache } from "./cache";
import { GraphQLClient, InMemoryMock } from "../test/utilties";
import { install } from '@sinonjs/fake-timers'

const client = new GraphQLClient(3000)
const clock = install()

async function setCache(input: CacheSetInput): Promise<void> {
        let ttlString = ''
        if (input.ttl != null) {
            ttlString = `ttl: "${input.ttl.toISOString()}"`
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

        const response = await client.request(mutation)
        if (response.errors != null) {
            throw new Error('got an error from the api.' + JSON.stringify(response.errors))
        }
}

async function getCache(key: string): Promise<CacheLookUpResult> {
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

    afterEach(() => {
        clock.reset()
    })

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

    it('Time past ttl expiration should result in not finding the object in the cache.', async () => {
        const key = 'myKey'
        const ttl = new Date()
        ttl.setDate(ttl.getDate() + 1)
        const value = 'myValue'
        await setCache({
            key, ttl, value
        })

        // Changing the time.
        await clock.tickAsync(ttl.valueOf() + 1)

        const response = await getCache(key)
        assert.equal(response.wasFound, false, 'should not have been found in cache.')
    }) 

    it('Object should be in cache if ttl has not expired.', async () => {
        const key = 'myKey'
        const ttl = new Date()
        ttl.setDate(ttl.getDate() + 1)
        const value = 'myValue'
        await setCache({
            key, ttl, value
        })

        // Changing the time to just before ttl.
        await clock.tickAsync(ttl.valueOf() - 1)
        
        const response = await getCache(key)
        assert.equal(response.wasFound, true, 'should have been found in cache.')
    }) 

    it.only('Removing ttl should prevent expiration.', async () => {
        const key = 'myKey'
        const ttl = new Date()
        ttl.setDate(ttl.getDate() + 1)
        const value = 'myValue'
        await setCache({
            key, ttl, value
        })

        // Changing the time.
        await clock.tickAsync(ttl.valueOf() + 1)

        await setCache({key, value})

        const response = await getCache(key)
        assert.equal(response.wasFound, true, 'Should still be in cache')
    }) 
})