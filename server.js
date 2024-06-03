/* $(document).ready(function () {
  $('button').click(function() { 
    $('p').first().toggleClass('test');
    $('p').last().css({
      'width': '',
      'height': '',
      'background-color': ''
    });
    // $('.result').html($('p').first().hasClass('test').toString());
  });
}); */

const http = require("http");
const { v4: uuidv4 } = require("uuid");
const { errorHandle, successHandle } = require("./Handle");
const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Length, X-Requested-With",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
  "Content-Type": "application/json",
};

let todos = [];

const requestListener = (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.method == "GET" && req.url == "/todo") {
    successHandle(res, todos);
  } else if (req.method == "POST" && req.url == "/todo") {
    req.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const todo = {
            title: title,
            id: uuidv4(),
          };
          todos.push(todo);
          successHandle(res, todos);
        } else {
          errorHandle(res, "沒有title");
        }
      } catch {
        errorHandle(res, "格式錯誤");
      }
    });
  } else if (req.method == "DELETE" && req.url == "/todo") {
    todos.length = 0;
    successHandle(res, todos, "刪除成功");
  } else if (req.method == "DELETE" && req.url.startsWith("/todo?")) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const title = url.searchParams.get("title");
    const id = url.searchParams.get("id");
    const beforeLength = todos.length;
    todos = todos.filter((item) => item.id != id);
    todos = todos.filter((item) => item.title != title);
    const afterLength = todos.length;
    if (beforeLength > afterLength) {
      successHandle(res, todos, "刪除成功");
    } else {
      errorHandle(res, "刪除失敗");
    }
    /* const id = req.url.split("?")[1];
    const index = todos.findIndex(todo => todo.id == id);
    if (index > -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        "massage": "刪除成功",
        "data": todos,
        "index": index
      }))
      res.end();
    }
    else {
      errorHandle(res, "刪除失敗");
    } */
  } else if (req.method == "PATCH" && req.url.startsWith("/todo")) {
    req.on("end", () => {
      try {
        const url = new URL(req.url, `https://${req.headers.host}`);
        const id = url.searchParams.get("id");
        const title = JSON.parse(body).title;
        const index = todos.findIndex((item) => item.id == id);
        console.log(url);
        console.log(id);
        console.log(title);
        console.log(index);
        if (title !== undefined && index > -1) {
          todos[index].title = title;
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              url: url,
              title: title,
              index: index,
              message: "更新資料成功",
              todos: todos,
            })
          );
          res.end();
        } else {
          errorHandle(res, "內容錯誤");
        }
      } catch {
        errorHandle(res, "格式錯誤");
      }
    });
  } else if (req.method == "OPTIONS" && req.url == "/todo") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.end(JSON.stringify({ status: "fail", message: "Not Found" }));
  }
};

const server = http.createServer(requestListener);
const port = process.env.PORT || 3005;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 處理應用程序退出信號
const shutdown = () => {
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use`);
  } else {
    console.error(`Server error: ${e}`);
  }
});
