import { join } from 'node:path'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
import express from 'express'
import { createHandler } from 'graphql-http/lib/use/express'
import expressPlayground from 'graphql-playground-middleware-express'
import { setUpDepedencies } from './dependencyInjection'
import { createExpressContext } from './context'
import http from "node:http"

export type ServerConfig = {
    port: number
}

export async function startServer(serverConfig: ServerConfig): Promise<http.Server> {
    // GraphQL Stuff
    const schema = loadSchemaSync(join(__dirname, 'schema.graphql'), {
        loaders: [new GraphQLFileLoader()]
    })

    const resolvers = setUpDepedencies()
    const schemaWithResolvers = addResolversToSchema({ schema, resolvers })
    const graphqlHandler = createHandler({
        schema: schemaWithResolvers,
        context: async (req: Express.Request, args) => {
            return createExpressContext(req)
        }
    })

    // Express Routes.
    const app = express()
    app.use('/graphql', (req, res, next) => {
        graphqlHandler(req, res, next)
    })

    // For graphiql 
    app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

    const httpServerPromise: Promise<http.Server> = new Promise(async httpServerResolve => {
        let httpServer: http.Server | null = null
        const serverStartPromise: Promise<void> = new Promise( resolve => {
            httpServer = app.listen(serverConfig.port, () => {
                resolve()
            })
        })

        await serverStartPromise

        if (httpServer == null) {
            throw new Error('Could not start http server in server.ts')
        }
        
        httpServerResolve(httpServer)
    })

    return httpServerPromise
}