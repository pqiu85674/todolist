const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
};
function errorHandle(res,massage) {
    res.writeHead(400, headers);
    res.write(JSON.stringify(
        {
            "status": "false",
            "massage": massage
        }));
    res.end();
}
function successHandle(res,todos,massage="成功") {
    res.writeHead(200, headers);
    res.write(JSON.stringify(
        {
            "status": "success",
            "todos":todos,
            "massage": massage
        }));
    res.end();

}

module.exports = {
    errorHandle,successHandle
};