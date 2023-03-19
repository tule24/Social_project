const authMethod = require('./authMethod')
const commentMethod = require('./commentMethod')
const postMethod = require('./postMethod')
const userMethod = require('./userMethod')
const messageMethod = require('./messageMethod')

module.exports = {
    ...authMethod,
    ...userMethod,
    ...postMethod,
    ...commentMethod,
    ...messageMethod
}
