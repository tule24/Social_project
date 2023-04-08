# Social Backend
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white) ![Apollo-GraphQL](https://img.shields.io/badge/-ApolloGraphQL-311C87?style=for-the-badge&logo=apollo-graphql)

## Menu 
- [Install & run](#install--run)
- [Setup server](#serverjs)
- Code flow
  - [Auth](#auth-schema)
  - [User](#user-schema)
## Install & run
`yarn install`: install dependencies in package.json  
`yarn test`: run app in development env  
`node server.js`: run app in product env

## Documentation
### `server.js`
#### `Express`
```js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
```
#### `Apollo & graphql`
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
#### `WebSocketServer`
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
#### `ApolloServer`
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
#### `App server`
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
## `Auth Schema`
|Type|Resolver|  
|-|-|
|register|[regiser](#register)|
|login|[login](#login)|
|logout|[logout](#logout)|
|refreshToken|[refreshToken](#refreshToken)|

### `Base type`
```graphql
type Auth {
  user: User!
  token: String!
  refreshToken: String!
}
```
### `register`
##### Mutation
```graphql
register(registerInput: registerInput!): User!
```
##### Input
```graphql
input registerInput {
  name: String
  password: String
  email: String
  ava: String
  dob: Date
  phone: String
  address: String
}
```
##### Resolver
```js
async ({ name, password, email }) => {
     if (!name || !password || !email) {
          throw GraphError(
               "Please provide name, password & email",
               "BAD_REQUEST"
          )
     }

     const user = await User.findOne({ email })
     if (user) {
          throw GraphError(
               "Email already exist",
               "BAD_REQUEST"
          )
     }

     const newUser = await User.create({
          name,
          password,
          email
     })

     return newUser
}
```
### `login`
##### Mutation
```graphql
login(loginInput: loginInput!): Auth!
```
##### Input type
```graphql
input loginInput {
  email: String
  password: String
}
```
##### Resolver
```js
async ({ email, password }) => {
     if (!email || !password) {
          throw GraphError(
               "Please provide email & password",
               "BAD_REQUEST"
          )
     }

     const user = await User.findOne({ email })
     if (!user) {
          throw GraphError(
               "Email not register",
               "BAD_REQUEST"
          )
     }

     const checkPass = await checkPassword(password, user.password)
     if (!checkPass) {
          throw GraphError(
               "Password not match",
               "UNAUTHORIZED"
          )
     }

     user.refreshToken = createRefreshJWT(user._id)
     await user.save()

     return {
          user,
          token: createJWT(user._id),
          refreshToken: user.refreshToken
     }
}
```
### `logout`
##### Mutation
```graphql
logout: String!
```
##### Resolver
```js
async (req) => {
     const user = await checkAuth(req)
     user.refreshToken = null
     await user.save()
}
```
### `refreshToken`
##### Mutation
```graphql
refreshToken(refreshToken: String!): Auth!
```
##### Resolver
```js
async (refreshToken) => {
     const user = await User.findOne({ refreshToken })
     if (!user) {
          throw GraphError(
               "Refreshtoken not exist",
               "UNAUTHENTICATED"
          )
     }

     jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

     user.refreshToken = createRefreshJWT(user._id)
     await user.save()

     return {
          user,
          token: createJWT(user._id),
          refreshToken: user.refreshToken
     }
}
```
## `User Schema`
|*|Type|Resolver|  
|-|-|-|
|Type|messageRoomOfUser|[messageRoomOfUser](#messageRoomOfUser)|
|Query|users|[getAllUser](#users)|
||user|[getUserById](#user)|
||friendOfUser|[getFriends](#friendOfUser)|
|Mutation|updateUser|[updateUser](#updateUser)|
||changePassword|[changePassword](#changePassword)|
||addFriend|[handleAddFriend](#addFriend)|
||confirmFriend|[handleConfirmFriend](#confirmFriend)|
||unFriend|[handleUnFriend](#unFriend)|


### `Base type`
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  ava: String
  phone: String
  address: String
  dob: Date
  createdAt: Date!
  updatedAt: Date!
  messageRoomOfUser: [MessageRoom]
}

type Friend {
  id: ID!
  name: String!
  ava: String
  status: String!
}
```
### `users`
##### Query
```graphql
users(page: Int, limit: Int): [User]!
```
##### Resolver
```js
async (user, args) => {
     const friendIds = user.friends.map(el => el.userId)
     const { limit, skip } = pagination(args)
     const users = await User.find({ _id: { $nin: [...friendIds, user._id] } }).skip(skip).limit(limit)
     return users
}
```
### `user`
##### Query
```graphql
user(userId: ID): User!
```
##### Resolver
```js
async (userId) => {
     const user = await checkFound(userId, User)
     return user
}
```
### `friendOfUser`
##### Query
```graphql
friendOfUser: [Friend]!
```
##### Resolver
```js
async (userId) => {
     const { friends } = await User.findById(userId).select('friends').populate({ path: "friends.userId", select: "_id name ava" })
     const formatFriends = friends.map(el => {
          return { ...el.userId._doc, id: el.userId._doc._id, status: el.status }
     })
     return formatFriends
}
```
### `updateUser`
##### Mutation
```graphql
updateUser(userInput: registerInput!): User!
```
##### Resolver
```js
async (user, userInput) => {
     if (userInput.password) {
          throw GraphError(
               "This router isn't used to update password",
               "BAD_REQUEST"
          )
     }

     let newUser
     if (userInput.ava) {
          const ava = await uploadImage([userInput.ava])
          if (ava.length > 0) {
               newUser = await User.findByIdAndUpdate(user._id, { ava: ava[0] }, { new: true, runValidators: true })
          } else {
               throw GraphError(
               "Something wrong when upload image to cloudinary",
               "BAD_REQUEST"
               )
          }
     } else {
          newUser = await User.findByIdAndUpdate(user._id, userInput, { new: true, runValidators: true })
     }
     return newUser
}
```
### `changePassword`
##### Mutation
```graphql
changePassword(oldPassword: String!, newPassword: String!): User!
```
##### Resolver
```js
async (user, oldPassword, newPassword) => {
     if (!newPassword || !oldPassword) {
          throw GraphError(
               "Please provide new & old password",
               "BAD_REQUEST"
          )
     }
     const checkPass = await checkPassword(oldPassword, user.password)
     if (!checkPass) {
          throw GraphError('Pasword not match. Please re-check password', 'UNAUTHORIZED')
     }

     user.password = newPassword
     user.passwordChangedAt = Date.now()
     await user.save()
     return user
}
```
### `addFriend`
##### Mutation
```graphql
addFriend(friendId: ID!): Friend!
```
##### Resolver
```js
async (user, friendId, pushNoti) => {
     const friend = await checkFound(friendId, User)

     friend.friends = addId(friend.friends, user._id, 'request')
     user.friends = addId(user.friends, friendId, 'waiting')

     await user.save()
     await friend.save()

     const noti = new Notification({
          userId: friendId,
          fromId: user._id,
          option: 'addfriend',
          contentId: user._id,
          content: `sent you a friend request`
     })

     await noti.save()
     pushNoti({
          id: noti._id,
          userId: noti.userId,
          fromId: noti.fromId,
          option: noti.option,
          contentId: noti.contentId,
          content: noti.content
     })

     return {
          id: friend._id,
          name: friend.name,
          ava: friend.ava,
          status: 'waiting'
     }
}
```
### `confirmFriend`
##### Mutation
```graphql
confirmFriend(friendId: ID!): Friend!
```
##### Resolver
```js
async (user, friendId, pushNoti) => {
     const friend = await checkFound(friendId, User)

     user.friends = updateId(user.friends, friendId, 'confirm')
     friend.friends = updateId(friend.friends, user._id, 'confirm')

     const newMessageRoom = new Message({
          users: [user._id, friendId],
          messages: []
     })
     await newMessageRoom.save()

     user.messageRooms.push(newMessageRoom._id)
     friend.messageRooms.push(newMessageRoom._id)
     await user.save()
     await friend.save()

     const noti = new Notification({
          userId: friendId,
          fromId: user._id,
          option: 'confirmfriend',
          contentId: user._id,
          content: `confirmed your request`
     })

     await noti.save()
     pushNoti({
          id: noti._id,
          userId: noti.userId,
          fromId: noti.fromId,
          option: noti.option,
          contentId: noti.contentId,
          content: noti.content
     })

     return {
          id: friend._id,
          name: friend.name,
          ava: friend.ava,
          status: 'confirm'
     }
}
```
### `unFriend`
##### Mutation
```graphql
unFriend(friendId: ID!): Friend!
```
##### Resolver
```js
async (user, friendId) => {
     const friend = await checkFound(friendId, User)

     user.friends = removeId(user.friends, friendId)
     friend.friends = removeId(friend.friends, user._id)

     await user.save()
     await friend.save()

     pushNoti({
          id: 'unfriend',
          userId: friendId,
          fromId: user._id,
          option: 'unfriend',
          contentId: user._id,
          content: 'unfriend'
     })

     return {
          id: friend._id,
          name: friend.name,
          ava: friend.ava
     }
}
```
### `messageRoomOfUser`
##### Type
```graphql
messageRoomOfUser: [MessageRoom]
```
##### Resolver
```js
async (messageRooms) => {
     const messageRoomsArr = await Message.find({ _id: { $in: messageRooms } })
     return messageRoomsArr
}
```
