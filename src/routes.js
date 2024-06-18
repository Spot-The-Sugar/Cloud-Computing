const { registerUser, loginUser, getUser, updateUser, getHistory, getHistoryById, getGradeById, consumeProduct, getSugarConsume, scanImage } = require("./handler");

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
    {
        method: 'PUT',
        path: '/consume',
        handler: consumeProduct,
    },
    {
        method: 'GET',
        path: '/track',
        handler: getSugarConsume,
    },
    {
        method: 'POST',
        path: '/scan',
        handler: scanImage,
    }
];
 
module.exports = routes;