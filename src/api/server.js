const
	express = require("express"),
	http = require('http'),
	{ Server } = require("socket.io"),
	{ getServers, getUsers, getModules, getModule } = require("./config");

let app = express();

app.get('/', (req, res) => {
	res.send(`
<script src="/socket.io/socket.io.js"></script>
<script>
	var socket = io();
	socket.on("log",console.log);
</script>`);
});

let server = http.createServer(app),
	port = Tumbot.global.port;

server.listen(port, () => {
	console.log('[webSocket] Listening on *:' + port);
});

let io = new Server(server);

io.on('connection', (socket) => {
	console.log('[webSocket] A user connected');
	socket.on("getServers", () => {
		socket.emit("log", getServers());
	});
	socket.on("getUsers", (serverId) => {
		socket.emit("log", getUsers(serverId));
	});
	socket.on("getModules", (serverId) => {
		socket.emit("log", getModules(serverId));
	});
	socket.on("getModule", ({serverId,moduleId}) => {
		socket.emit("log", getModule(serverId,moduleId));
	});
});
module.exports = io;