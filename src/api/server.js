const
	express = require("express"),
	http = require('http'),
	{ Server } = require("socket.io"),
	config = require("./config");

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

let io = new Server(server, {
	cors: {
		origin: "http://localhost:4000",
		methods: ["GET", "POST"]
	}
});
io.on('connection', socket => {
	console.log(`[webSocket] A user connected: ${socket.id}`);



let sockets = {
	disconnect: () => {
		console.log("[websocket] Client Disconnected!");
	},
	getServers: async () => {
		socket.emit("updateServers", await config.getServers());
	},
	getUsers: async (serverId) => {
		socket.emit("log", await config.getUsers(serverId));
	},
	getModules: async (serverId) => {
		socket.emit("updateModules", await config.getModules(serverId));
	},
	getModule: async ({ serverId, moduleId }) => {
		if (!serverId || !moduleId) return;
		socket.emit("updateModule", await config.getModule({ serverId, moduleId }));
	},
	updateModule: async ({ serverId, moduleId, moduleConfig }) => {
		if (!serverId || !moduleId || !moduleConfig) {
			console.log("error updating module")
			return;
		}
		let module = Tumbot.modules[moduleId];
		if (module && module.updateConfig){
			module.updateConfig(serverId, moduleConfig);
			config.updateModule({serverId, moduleId, moduleConfig})
		}
	}
};

	for (const ev in sockets) {
		socket.on(ev, async (...args) => {
			console.log(`[websocket][${socket.id}] ${ev}:`, ...args);
			return await sockets[ev](...args);
		});
	}
});
module.exports = io;