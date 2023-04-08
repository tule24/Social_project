# Social Backend
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white) ![Apollo-GraphQL](https://img.shields.io/badge/-ApolloGraphQL-311C87?style=for-the-badge&logo=apollo-graphql)

## Menu 
- [Install & run](#install--run)
- [Setup server](#serverjs)

## Install & run
`yarn install`: install dependencies in package.json  
`yarn test`: run app in development env  
`node server.js`: run app in product env

## Documentation
### `server.js`
Set up express
```js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
```
Set up apollo & graphql
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
Set up WebSocketServer
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
Set up ApolloServer
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
Set up app server
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
- `models`
User model
```js
const userSchema = new Schema({
    name: {
        type: String,
        require: [true, "Please provide your name"],
        trim: true,
        minLength: [3, "Name length >= 3"],
        maxLength: [32, "Name length < 32"]
    },
    password: {
        type: String,
        require: [true, "Please provide password"]
    },
    email: {
        type: String,
        require: [true, "Please provide your email"],
        validate: {
            validator: function (val) {
                return validator.default.isEmail(val)
            },
            message: "Email invalid"
        }
    },
    dob: {
        type: Date,
        default: Date.now
    },
    ava: {
        type: String,
        default: '/avatar.png'
    },
    phone: String,
    address: String,
    friends: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            status: {
                type: String,
                require: [true, 'Please provide status friend'],
                enum: ['waiting', 'request', 'confirm']
            }
        }
    ],
    messageRooms: [
        {
            type: Schema.Types.ObjectId,
            ref: 'messages'
        }
    ],
    refreshToken: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
}, { timestamps: true })
module.exports = model('users', userSchema)
```
Post model
```js
const postSchema = new Schema({
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        require: [true, "Please provide creator id"]
    },
    content: {
        type: String,
        trim: true,
        require: [true, "Please provide content"],
        minLength: [1, "Content length > 0"]
    },
    media: [{
        type: String
    }],
    like: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    vision: {
        type: String,
        enum: ['private', 'public', 'friend'],
        default: 'friend'
    },
    totalComment: {
        type: Number,
        default: 0
    }
}, { timestamps: true })
module.exports = model('posts', postSchema)
```
Comment model 
```js
const commentSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'posts'
    },
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    content: {
        type: String,
        trim: true,
        require: [true, "Please provide content"],
        minLength: [1, "Content length > 0"]
    },
    like: [{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],
    replies: [
        {
            creatorId: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            content: {
                type: String,
                trim: true,
                require: [true, "Please provide content"],
                minLength: [1, "Content length > 0"]
            },
            like: [{
                type: Schema.Types.ObjectId,
                ref: 'users'
            }],
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true })
module.exports = model('comments', commentSchema)
```
Message model 
```js
const messageSchema = new Schema({
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    lastMessage: {
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            require: [true, "Please provide creator id"]
        },
        content: {
            type: String,
            trim: true,
            minLength: [1, "Content length > 0"]
        }
    },
    messages: [
        {
            creatorId: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                require: [true, "Please provide creator id"]
            },
            content: [
                {
                    message: {
                        type: String,
                        trim: true,
                        require: [true, "Please provide content"],
                        minLength: [1, "Content length > 0"]
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ]
        }
    ]
}, { timestamps: true })
module.exports = model('messages', messageSchema)
```
Notification model 
```js
const messageSchema = new Schema({
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    lastMessage: {
        creatorId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            require: [true, "Please provide creator id"]
        },
        content: {
            type: String,
            trim: true,
            minLength: [1, "Content length > 0"]
        }
    },
    messages: [
        {
            creatorId: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                require: [true, "Please provide creator id"]
            },
            content: [
                {
                    message: {
                        type: String,
                        trim: true,
                        require: [true, "Please provide content"],
                        minLength: [1, "Content length > 0"]
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ]
        }
    ]
}, { timestamps: true })
module.exports = model('messages', messageSchema)
```
- `schema.graphql`
Input type
```graphql
#register
input registerInput {
  name: String
  password: String
  email: String
  ava: String
  dob: Date
  phone: String
  address: String
}

#login
input loginInput {
  email: String
  password: String
}

#post
input postInput {
  content: String
  media: [String]
  vision: String
}
```
Basic type
```graphql
#date
scalar Date

#auth
type Auth {
  user: User!
  token: String!
  refreshToken: String!
}

#user
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

#friend
type Friend {
  id: ID!
  name: String!
  ava: String
  status: String!
}

#message
type MessageChild {
  message: String!
  createdAt: Date!
}
type Message {
  id: ID!
  roomId: ID!
  creator: User!
  content: [MessageChild]!
}
type LastMessage {
  creatorId: ID
  content: String
}
type MessageRoom {
  id: ID!
  users: [User]!
  messages: [Message]!
  lastMessage: LastMessage
  updatedAt: Date!
}

#post
type Post {
  id: ID!
  creator: User!
  content: String
  media: [String]
  totalLike: Int!
  userLike: [User]!
  liked: Boolean!
  vision: String!
  totalComment: Int!
  createdAt: Date!
  updatedAt: Date!
}

#comment
type Comment {
  id: ID!
  creator: User!
  content: String!
  createdAt: Date!
  totalLike: Int!
  userLike: [User]!
  liked: Boolean!
  totalReplies: Int!
}

#replies
type Replies {
  id: ID!
  creator: User!
  content: String!
  createdAt: Date!
  totalLike: Int!
  liked: Boolean!
  userLike: [User]!
}

#notification
type Notification {
  id: ID!
  from: User!,
  option: String!,
  contentId: ID!,
  content: String!
}
```
Query type
```graphql
type Query {
#user
  users(page: Int, limit: Int): [User]!
  user(userId: ID): User!
  friendOfUser: [Friend]!

#post
  post(postId: ID!): Post!
  postOfOwner(page: Int, limit: Int): [Post]!
  postForUser(page: Int, limit: Int): [Post]!
  postOfUser(userId: ID!, page: Int, limit: Int): [Post]!

#comment
  commentOfPost(postId: ID!, page: Int, limit: Int): [Comment]!
  commentById(commentId: ID!): Comment!
  repliesOfComment(commentId: ID!): [Replies]!
  repliesById(commentId: ID!, repliesId: ID!): Replies!

#message
  getMessageRoom(roomId: ID!): MessageRoom!

#notification
  getNotification(page: Int, limit: Int): [Notification]!
}
```
Mutation type
```graphql
type Mutation {
#authMutation
  register(registerInput: registerInput!): User!
  login(loginInput: loginInput!): Auth!
  logout: String!
  refreshToken(refreshToken: String!): Auth!

#userMutation
  updateUser(userInput: registerInput!): User!
  changePassword(oldPassword: String!, newPassword: String!): User!
  addFriend(friendId: ID!): Friend!
  confirmFriend(friendId: ID!): Friend!
  unFriend(friendId: ID!): Friend!

#postMutation
  createPost(postInput: postInput!): Post!
  updatePost(postId: ID!, postInput: postInput!): Post!
  deletePost(postId: ID!): Post!
  likePost(postId: ID!): Post!
  unlikePost(postId: ID!): Post!

#commentMutation
  createComment(postId: ID!, content: String!): Comment!
  updateComment(commentId: ID!, content: String!): Comment!
  deleteComment(commentId: ID!): Comment!
  likeComment(commentId: ID!): Comment!
  unlikeComment(commentId: ID!): Comment!
  createReplies(commentId: ID!, content: String!): Replies!
  updateReplies(commentId: ID!, repliesId: ID!, content: String!): Replies!
  likeReplies(commentId: ID!, repliesId: ID!): Replies!
  unlikeReplies(commentId: ID!, repliesId: ID!): Replies!
  deleteReplies(commentId: ID!, repliesId: ID!): Replies!

#messageMutation
  createMessage(roomId: ID!, content: String!): Message!
  createMessageRoom(users: [ID!]!): MessageRoom!
  deleteMessageRoom(roomId: ID!): MessageRoom!
  leaveMessageRoom(roomId: ID!): MessageRoom!
}
```
Subscription type 
```graphql
type Subscription {
#message
  messageCreated: Message!

#notification
  notificationCreated: Notification!
}
```
