const { registerUser, loginUser, getUser, updateUser, getHistory } = require("./handler");

const routes = [
    {
        method: 'POST',
        path: '/register',
        handler: registerUser,
    },
    {
        method: 'POST',
        path: '/login',
        handler: loginUser,
    },
    {
        method: 'GET',
        path: '/profile',
        handler: getUser,
    },
    {
        method: 'PUT',
        path: '/editProfile',
        handler: updateUser,
    },
    {
        method: 'GET',
        path: '/history',
        handler: getHistory,
    }
];
 
module.exports = routes;