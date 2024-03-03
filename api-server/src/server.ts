import { join } from 'node:path'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
import express from 'express'
import { createHandler } from 'graphql-http/lib/use/express'
import expressPlayground from 'graphql-playground-middleware-express'
import { setUpDepedencies } from './dependencyInjection'
import { createExpressContext } from './context'

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


const port = 3000
app.listen(port)
console.log(`Server started. Playground at: http://localhost:${port}/playground`)