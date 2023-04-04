const authMethod = require('./authMethod')
const commentMethod = require('./commentMethod')
const postMethod = require('./postMethod')
const userMethod = require('./userMethod')
const messageMethod = require('./messageMethod')
const notificationMethod = require('./notificationMethod')

module.exports = {
    ...authMethod,
    ...userMethod,
    ...postMethod,
    ...commentMethod,
    ...messageMethod,
    ...notificationMethod
}
