const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const GraphError = require('../errors')
const User = require('../models/User')

const checkPassword = async (password, hashedPassword) => {
    const check = await bcrypt.compare(password, hashedPassword)
    return check
}

const checkPasswordChange = function (passwordChangedAt, JWTTimestamp) {
    if (passwordChangedAt) {
        const changedTimestamp = parseInt(passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < changedTimestamp
    }
    return false
}

const createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex")
    const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    const passwordResetExpires = Date.now() + 10 * 60 * 1000

    return { resetToken, passwordResetToken, passwordResetExpires }
}

const createJWT = (userId) => jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
)

const createRefreshJWT = (userId) => jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_LIFETIME }
)

const checkAuth = async (req) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw GraphError(
            "Authentication invalid",
            "UNAUTHENTICATED"
        )
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const curUser = await User.findById(decoded.userId)
    if (!curUser) {
        throw GraphError(
            "User belonging to this token no longer exist",
            "UNAUTHENTICATED"
        )
    }

    if (checkPasswordChange(curUser.passwordChangedAt, decoded.iat)) {
        throw GraphError(
            "User recent changed the password. Please log in again with new password",
            "UNAUTHENTICATED"
        )
    }
    return curUser
}

module.exports = { checkPassword, createJWT, checkPasswordChange, createPasswordResetToken, createRefreshJWT, checkAuth }