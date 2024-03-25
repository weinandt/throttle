import http from "node:http"
import { ServerConfig, startServer } from "../server";
import assert from "node:assert";
import { Overrides, setUpDepedencies } from "../dependencyInjection";
import { Cache, InMemoryCache, InMemoryMock } from "./cache";

describe('Cache Integration Tests', function () {
    const inMemoryCache: InMemoryCache = new InMemoryCache()
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
        const query = {
            query: `
            {
                get(key: "doesNotExist") {
                    wasFound
                }
            }
          `
        };

        const response = await fetch(`http://localhost:${serverConfig.port}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(query)
        })
        const responseJson: any = await response.json()

        assert.equal(responseJson.data.get.wasFound, false)
    })
});