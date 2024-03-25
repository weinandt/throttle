import http from "node:http"
import { ServerConfig, startServer } from "../server";
import assert from "node:assert";

describe('Cache Integration', function () {
    const serverConfig: ServerConfig = {
        port: 3000
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
        // runs before each test in this block
    });

    afterEach(function () {
        // runs after each test in this block
    });

    it('Item not in the cache should return not found', async () => {
        const query = {
            query: `
            {
                get(key: "doesNotExist") {
                    wasFound
                    value
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

       // assert.deepEqual(responseJson)
        assert.equal(responseJson.data.get.wasFound, false)
    })
});