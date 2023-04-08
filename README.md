# Social Backend
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white) ![Apollo-GraphQL](https://img.shields.io/badge/-ApolloGraphQL-311C87?style=for-the-badge&logo=apollo-graphql)

## Menu 
- [Install & run](#install--run)
- [Setup server](#serverjs)
  - [Express](#express)
  - [Apollo & graphql](#apollo--graphql)
  - [WebSocketServer](#websocketserver)
  - [ApolloServer](#apolloserver)
  - [App Server](#app-server)
## Install & run
`yarn install`: install dependencies in package.json  
`yarn test`: run app in development env  
`node server.js`: run app in product env

## Documentation
### `server.js`
#### Express
```js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
```
#### Apollo & graphql
```js
// apollo
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')

// web socket
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

// graphql
const { readFileSync } = require('fs')
const { gql } = require('graphql-tag')
const typeDefs = gql(readFileSync(`${__dirname}/graphql/schema/schema.graphql`, { encoding: 'utf-8' }))
const resolvers = require('./graphql/resolvers')
const GraphError = require('./errors')
const DataLoader = require('dataloader')
```
#### WebSocketServer
```js
const wsServer = new WebSocketServer({
     server: httpServer,
     path: '/graphql'
})
const serverCleanup = useServer({
     schema,
     context: async (ctx) => {
          try {
               const user = await checkAuth(ctx.connectionParams, true)
               return {
                    dbMethods,
                    userId: user._id,
                    userLoader: new DataLoader(async ids => ids.map(id => dbMethods.getUserById(id)))
               }
          } catch (error) {
               throw GraphError(error.message, 'UNAUTHORIZED')
          }
     }
}, wsServer)
```
#### ApolloServer
```js
const server = new ApolloServer({
     schema,
     plugins: [
          ApolloServerPluginDrainHttpServer({ httpServer }),
          {
               async serverWillStart() {
                    return {
                         async drainServer() {
                              await serverCleanup.dispose()
                         }
                    }
               }
          }
     ],
     includeStacktraceInErrorResponses: false
})
```
#### App server
```js
await server.start()
app.use('/graphql', cors(), express.json({ limit: '25mb' }), express.urlencoded({ limit: '25mb' }), expressMiddleware(server, {
     context: ({ req }) => ({
          dbMethods,
          req,
          userLoader: new DataLoader(async ids => ids.map(id => dbMethods.getUserById(id)))
     })
}))

await connectDB(process.env.MONGO_URI)
const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
     console.log(`🚀 Server running at http://localhost:${PORT}/graphql`);
})
```
