const { createUser, loginUser, updateUser, readUser } = require("./handler");

const routes = [
    {
        method: 'POST',
        path: '/register',
        handler: createUser,
    },
    {
        method: 'POST',
        path: '/login',
        handler: loginUser,
    },
    {
        method: 'GET',
        path: '/readUser',
        handler: readUser,
    },
    {
        method: 'PUT',
        path: '/updateUser',
        handler: updateUser,
    },
    {
        method: 'DELETE',
        path: '/deleteUser',
        handler: () => {},
    },
    {
        method: 'GET',
        path: '/history',
        handler: () => {},
    },
    {
        method: 'POST',
        path: '/scanProduct',
        handler: () => {},
    }
];
 
module.exports = routes;