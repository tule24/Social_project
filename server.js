// express
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')

// const apollo
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')

const { readFileSync } = require('fs')
const { gql } = require('graphql-tag')
const connectDB = require('./db/connectDB')

const typeDefs = gql(readFileSync(`${__dirname}/graphql/schema/schema.graphql`, { encoding: 'utf-8' }))
const resolvers = require('./graphql/resolvers')
const dbMethods = require('./db/dbMethod')

async function start() {
    const app = express()
    app.use(express.json())

    const server = new ApolloServer({ typeDefs, resolvers })
    const port = process.env.PORT || 4000

    try {
        await connectDB(process.env.MONGO_URI)
        const { url } = await startStandaloneServer(server, {
            listen: port,
            context: ({ req }) => ({ dbMethods, req })
        })
        console.log(`🚀 Server running at ${url}`);
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

start()