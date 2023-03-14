const { users } = require('../sampleData.json')

const userMethod = {
    getAllUser: (name) => {
        if (name) {
            return users.filter(el => el.name.includes(name))
        }
        return users
    },
    getUser: (wallet) => users.find(el => el.wallet === wallet),
    getUserById: (id) => users.find(el => el.id === id),
    getFriendOfUser: (userId) => {
        const friendIds = users.find(el => el.id === userId).friends || [];
        const friends = friendIds.map(el => users.find(user => user.id === el))
        return friends
    },
    getUserLike: (like) => {
        if (like) {
            const friends = like.map(el => users.find(user => user.id === el))
            return friends
        }
        return []
    }
}

module.exports = userMethod