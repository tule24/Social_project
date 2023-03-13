const mongoose = require('mongoose')
// connect DB
const connectDB = async (uri) => {
    mongoose.set('strictQuery', false)
    return mongoose.connect(uri)
        .then(() => console.log("CONNECT TO THE DB..."))
        .catch((err) => console.log(err))
}

module.exports = connectDB