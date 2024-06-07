const { registerUser, loginUser, getUser, updateUser, getHistory, getHistoryById, getGradeById } = require("./handler");

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
        path: '/profile/edit',
        handler: updateUser,
    },
    {
        method: 'GET',
        path: '/history',
        handler: getHistory,
    },
    {
        method: 'GET',
        path: '/history/{scanId}',
        handler: getHistoryById,
    },
    {
        method: 'GET',
        path: '/grade/{gradeId}',
        handler: getGradeById,
    },
];
 
module.exports = routes;