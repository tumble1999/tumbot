const
	express = require("express"),
	http = require('http'),
	{ Server } = require("socket.io");

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
	port = process.env.PORT||Tumbot.global.port;

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
		socket.emit("updateServers", await Tumbot.config.getServers());
	},
	getUsers: async ({serverId}) => {
		socket.emit("log", await Tumbot.config.getUsers(serverId));
	},
	getModules: async ({serverId}) => {
		socket.emit("updateModules", await Tumbot.config.getModules(serverId));
	},
	getModule: async ({ serverId, moduleId }) => {
		if (!serverId || !moduleId) return;
		socket.emit("updateModule", await Tumbot.config.getModule({ serverId, moduleId }));
	},
	updateModule: async ({ serverId, moduleId, moduleConfig }) => {
		if (!serverId || !moduleId || !moduleConfig) {
			return console.log("[webSocket] Server, Module or new Config not specified!");
		}
		let module = Tumbot.modules[moduleId];
		if (module && module.updateConfig){
			module.updateConfig(serverId, moduleConfig);
			await Tumbot.config.updateModule({serverId, moduleId, moduleConfig})
		}
	},
	getLang: async ({serverId}={}) =>{
		if(!serverId) return;
		let module = await Tumbot.config.getModule({ serverId, moduleId:"core" }),
			lang = module.lang||"en-gb";
		socket.emit("updateLang",await Tumbot.lang.getLang(lang));
	},
	getPrefix: async ({serverId}={})=>{
		if(!serverId) return;
		let module = await Tumbot.config.getModule({ serverId, moduleId:"core" }),
		prefix = module.prefix||"!";
		socket.emit("updatePrefix",prefix);
		
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