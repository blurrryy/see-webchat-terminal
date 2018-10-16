const blessed = require("blessed");
const contrib = require("blessed-contrib");
const express = require("express");
const logger = require("./logger");

/* REMOVE ME LATER */

const bodyParser = require("body-parser");

/* END */

const { screen, scr } = require("./screen");
const log = t => scr.top.left.log(t);
const sse = t => scr.bot.right.log(t);
const api = t => scr.bot.left.log(t);

const app = express();

// Custom logging enabled
app.use(logger(scr.bot.left));

// The routes

/* 

CHAT TEST FOR TERMINAL HERE

*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let clientId = 0;
let clients = {};
let actUserName = "";
let clientNames = {};

let timestamp = (function() {
  let date = new Date();
  return `[${date.getHours()}:${
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
  }]`;
})();

let sendText = (text, showUserName = true) => {
  let bc = false;
  for (clientId in clients) {
    let data = "";
    if (showUserName) {
      data = `data: ${timestamp} <${actUserName}> ${text}\n\n`;
      bc ? log(`${timestamp} <${actUserName}> ${text}`) : null;
      sse(
        `${timestamp} SSE send message from ${actUserName} to client #${clientId}`
      );
    } else {
      data = `data: ${timestamp} ${text}\n\n`;
      bc ? log(`${timestamp} ${text}`) : null;
      sse(`${timestamp} SSE send event to client #${clientId}`);
    }
    clients[clientId].write(data);
    bc = true;
  }
};

app.use("/", express.static("static"));

app.get("/chat/:name", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.write("\n");
  sse(`${timestamp} Client connection: ${req.params.name}`);
  (function(clientId) {
    clients[clientId] = res;
    clientNames[clientId] = req.params.name;
    req.on("close", () => {
      delete clients[clientId];
      actUserName = "";
      sendText(clientNames[clientId] + " disconnected!", false);
      sse(`${timestamp} Client disconnected: ${clientNames[clientId]}`);
      delete clientNames[clientId];
    });
  })(++clientId);

  sendText(req.params.name + " connected!", false);
  let allMates = "";
  for (cliId in clientNames) {
    allMates += `${clientNames[cliId]}`;
    if (cliId < clientId) allMates += " ";
  }
  sendText(`logged in [${allMates}]`, false);
});

app.post("/write/", (req, res) => {
  actUserName = req.body.name;
  sendText(req.body.text);
  res.json({ success: true });
});

/* END */

// Start server
app.listen(3000, () => {
  log("Webserver listening on port 3000...");
  log("Open your browser and connect to http://<your-ip>:3000");
  log("");
  log("");
  api("API up and running...");
});
