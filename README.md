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
- [Setup models](#models)
  - [User](#user-model)
  - [Post](#post-model)
  - [Comment](#comment-model)
  - [Message](#message-model)
  - [Notification](#notification-model)
- [Setup schema](#schema)
  - [Input type](#input-type)
  - [Basic type](#basic-type)
  - [Query type](#query-type)
  - [Mutation type](#mutation-type)
  - [Subscription type](#subscription-type)
- [Setup resolver](#resolver)
  - [Auth resolver](#auth-resolver)
    - [Mutation](#auth-mutation)
  - [User resolver](#user-resolver)
    - [Query](#user-query)
    - [Mutation](#user-mutation)
    - [Type](#user-type)
  - [Post resolver](#post-resolver)
    - [Query](#post-query)
    - [Mutation](#post-mutation)
    - [Type](#post-type)
  - [Comment resolver](#comment-resolver)
    - [Query](#comment-query)
    - [Mutation](#comment-mutation)
    - [Type](#comment-type)
  - [Message resolver](#message-resolver)
    - [Query](#message-query)
    - [Mutation](#message-mutation)
    - [Subscription](#message-subscription)
    - [Type](#message-type)
  - [Notification resolver](#notification-resolver)
    - [Query](#message-query)
    - [Subscription](#message-subscription)
    - [Type](#message-type)
  - [Type resolver](#type-resolver)
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
### `Models`  
#### User model
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
#### Post model
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
#### Comment model
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
#### Message model
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
#### Notification model 
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
### `Schema`  
#### Input type
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
#### Basic type
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
#### Query type
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
#### Mutation type
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
#### Subscription type
```graphql
type Subscription {
#message
  messageCreated: Message!

#notification
  notificationCreated: Notification!
}
```
### `Resolver`  
#### `Auth resolver`
#### Auth mutation
```js
const authMutation = {
    register: catchAsync(async (_, { registerInput }, { dbMethods }) => {
        const user = await dbMethods.regiser(registerInput)
        return user
    }),
    login: catchAsync(async (_, { loginInput }, { dbMethods }) => {
        const auth = await dbMethods.login(loginInput)
        return auth
    }),
    logout: catchAsync(async (_, __, { dbMethods, req }) => {
        await dbMethods.logout(req)
        return "Logout success"
    }),
    refreshToken: catchAsync(async (_, { refreshToken }, { dbMethods }) => {
        return await dbMethods.refreshToken(refreshToken)
    })
}
```
#### `User resolver`
#### User query
```js
const userQuery = {
    users: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getAllUser(user, args)
    }),
    user: catchAsync(async (_, { userId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        const id = userId ? userId : user._id
        return await dbMethods.getUserById(id)
    }),
    friendOfUser: catchAsync(async (_, __, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getFriends(user._id)
    })
}
```
#### User mutation
```js
const userMutation = {
    updateUser: catchAsync(async (_, { userInput }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updateUser(user, userInput)
    }),
    changePassword: catchAsync(async (_, { oldPassword, newPassword }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.changePassword(user, oldPassword, newPassword)
    }),
    addFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleAddFriend(user, friendId, pushNoti)
    }),
    confirmFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleConfirmFriend(user, friendId, pushNoti)
    }),
    unFriend: catchAsync(async (_, { friendId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.handleUnFriend(user, friendId)
    })
}
```
#### User type
const userResolver = {
    User: {
        messageRoomOfUser: ({ messageRooms }, _, { dbMethods }) => {
            return dbMethods.getMessageOfUser(messageRooms)
        }
    }
}
#### `Post resolver`
#### Post query
```js
const postQuery = {
    post: catchAsync(async (_, { postId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getPostById(user._id, postId)
    }),
    postForUser: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getPostsForUser(user, args)
    }),
    postOfUser: catchAsync(async (_, { userId, ...args }, { dbMethods, req }) => {
        const caller = await checkAuth(req)
        return await dbMethods.getPostsOfUser(caller, userId, args)
    }),
    postOfOwner: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getPostsOfOwner(user._id, args)
    })
}
```
#### Post mutation
```js
const postMutation = {
    createPost: catchAsync(async (_, { postInput }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.createPost(user, postInput)
    }),
    updatePost: catchAsync(async (_, { postId, postInput }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updatePost(user, postId, postInput)
    }),
    likePost: catchAsync(async (_, { postId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.likePost(user, postId, pushNoti)
    }),
    unlikePost: catchAsync(async (_, { postId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.unlikePost(user, postId, pushNoti)
    }),
    deletePost: catchAsync(async (_, { postId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.deletePost(user, postId)
    })
}
```
#### Post type
```js
const postResolver = {
    Post: {
        creator: catchAsync(async ({ creatorId }, _, { userLoader }) => {
            const creator = await userLoader.load(creatorId.toString())
            return creator
        }),
        userLike: catchAsync(({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        }),
        totalLike: ({ like }) => {
            return like.length
        }
    }
}
```
#### `Comment resolver`
#### Comment query
```js
const commentQuery = {
    commentOfPost: catchAsync(async (_, { postId, ...args }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getCommentsOfPost(user._id, postId, args)
    }),
    commentById: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        await checkAuth(req)
        return await dbMethods.getCommentById(commentId)
    }),
    repliesOfComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.getRepliesOfComment(user._id, commentId)
    }),
    repliesById: catchAsync(async (_, { commentId, repliesId }, { dbMethods, req }) => {
        await checkAuth(req)
        return await dbMethods.getRepliesById(commentId, repliesId)
    }),
}
```
#### Comment mutation
```js
const commentMutation = {
    createComment: catchAsync(async (_, { postId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.createComment(user, postId, content, pushNoti)
    }),
    updateComment: catchAsync(async (_, { commentId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updateComment(user, commentId, content)
    }),
    deleteComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.deleteComment(user, commentId)
    }),
    likeComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.likeComment(user, commentId)
    }),
    unlikeComment: catchAsync(async (_, { commentId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.unlikeComment(user, commentId)
    }),

    createReplies: catchAsync(async (_, { commentId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.createReplies(user, commentId, content)
    }),
    updateReplies: catchAsync(async (_, { commentId, repliesId, content }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.updateReplies(user, commentId, repliesId, content)
    }),
    deleteReplies: catchAsync(async (_, { commentId, repliesId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.deleteReplies(user, commentId, repliesId)
    }),
    likeReplies: catchAsync(async (_, { commentId, repliesId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.likeReplies(user, commentId, repliesId)
    }),
    unlikeReplies: catchAsync(async (_, { commentId, repliesId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return await dbMethods.unlikeReplies(user, commentId, repliesId)
    }),
}
```
#### Comment type
```js
const commentResolver = {
    Comment: {
        creator: catchAsync(async ({ creatorId }, _, { userLoader }) => {
            const creator = await userLoader.load(creatorId.toString())
            return creator
        }),
        userLike: catchAsync(({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        }),
        totalReplies: ({ replies }) => {
            return replies.length
        },
        totalLike: ({ like }) => {
            return like.length
        },

    },
    Replies: {
        creator: catchAsync(async ({ creatorId }, _, { userLoader }) => {
            const creator = await userLoader.load(creatorId.toString())
            return creator
        }),
        userLike: catchAsync(({ like }, _, { dbMethods }) => {
            return dbMethods.getUserLike(like)
        }),
        totalLike: ({ like }) => {
            return like.length
        },
    }
}
```
#### `Message resolver`
#### Message query
```js
const messageQuery = {
    getMessageRoom: catchAsync(async (_, { roomId }, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.getMessageRoom(user, roomId)
    })
}
```
#### Message mutation
```js
const messageMutation = {
    createMessage: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.createMessage(user, args, pubsub)
    }),
    createMessageRoom: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.createMessageRoom(user, args)
    }),
    deleteMessageRoom: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.deleteMessageRoom(user, args)
    }),
    leaveMessageRoom: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.leaveMessageRoom(user, args)
    })
}
```
#### Message subscription
```js
const messageSubscription = {
    messageCreated: {
        subscribe: withFilter(
            () => {
                return pubsub.asyncIterator('MESSAGE_CREATED')
            },
            (parent, _, { userId }) => {
                return parent.messageCreated.users.includes(userId)
            }
        )
    }
}
```
#### Message type
```js
const messageResolver = {
    Message: {
        creator: catchAsync(async ({ creator, creatorId }, _, { userLoader }) => {
            if (creator) {
                return creator
            }
            const res = await userLoader.load(creatorId.toString())
            return res
        })
    },
    MessageRoom: {
        users: catchAsync(async ({ users }, _, { dbMethods }) => {
            return dbMethods.getUserLike(users)
        })
    }
}
```
#### `Notification resolver`
#### Notification query
```js
const notificationQuery = {
    getNotification: catchAsync(async (_, args, { dbMethods, req }) => {
        const user = await checkAuth(req)
        return dbMethods.getNotification(user, args)
    })
}
```
#### Notification subscription
```js
const notificationResolver = {
    Notification: {
        from: catchAsync(async ({ fromId }, _, { userLoader }) => {
            const from = await userLoader.load(fromId.toString())
            return from
        })
    }
}
```
#### Notification type
```js
const notificationSubscription = {
    notificationCreated: {
        subscribe: withFilter(
            () => {
                return pubsub.asyncIterator('NOTIFICATION_CREATED')
            },
            (parent, _, { userId }) => {
                return parent.notificationCreated.userId.equals(userId)
            }
        )
    }
}
```
#### `Type resolver`
```js
const dateResolver = new GraphQLScalarType({
    name: 'Date',
    parseValue(value) {
        return new Date(value)
    },
    serialize(value) {
        return value.toLocaleString()
    }
})

const typeResolver = {
    Date: dateResolver
}
```
