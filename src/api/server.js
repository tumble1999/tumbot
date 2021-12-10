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
	port = process.env.PORT || Tumbot.global.port;

server.listen(port, () => {
	console.log('[webSocket] Listening on *:' + port);
});

let io = new Server(server, {
	cors: {
		origin: function (origin, callback) { callback(null, true); },
		methods: ["GET", "POST"]
	}
});
io.on('connection', socket => {
	console.log(`[webSocket] A user connected: ${socket.id}`);

	let sockets = {
		disconnect: () => {
			console.log("[websocket] Client Disconnected!");
		},
		login: async ({ code, serverId, moduleId }) => {
			let info = await Tumbot.oauth.getUserInfo({ accessToken: code });
			socket.login = info;
			if (info) {
				let userId = info.id;
				socket.emit("updateLogin", info);
				socket.emit("updateInvite", Tumbot.bot.getBotInviteLink());
				socket.emit("updateServers", await Tumbot.config.getServers({userId}));

				if (userId && !await Tumbot.perms.hasPerm({ serverId, userId })) {
					socket.emit("updateResponse",403);
					return;
				};

				socket.emit("updateResponse",200);
				socket.emit("updateUsers", await Tumbot.config.getUsers(serverId));
				socket.emit("updateModules", await Tumbot.config.getModules(serverId));

				let core = await Tumbot.config.getModule({serverId, moduleId: "core" }),
					lang = core.lang || "en-gb",
					prefix = core.prefix || "!";
				socket.emit("updateLang", await Tumbot.lang.getLang(lang));
				socket.emit("updatePrefix", prefix);

				socket.emit("updateModule", await Tumbot.config.getModule({serverId, moduleId }));

			} else {
				socket.emit("refreshLogin");
			}
		},
		getModules:async ({serverId})=>{
			socket.emit("updateModules", await Tumbot.config.getModules(serverId));
		},
		getModule:async ({serverId,moduleId})=>{
			socket.emit("updateModule", await Tumbot.config.getModule({serverId, moduleId }));
		},
		updateModule: async ({ serverId, moduleId, moduleConfig }) => {
			if (!serverId || !moduleId || !moduleConfig) {
				return console.log("[webSocket] Server, Module or new Config not specified!");
			}
			let module = Tumbot.modules.get(moduleId);
			if (module && module.updateConfig) {
				module.updateConfig(serverId, moduleConfig);
				await Tumbot.config.updateModule({ serverId, moduleId, moduleConfig });
			}
		},
		logout: async () => {
			if (socket.login) {
				Tumbot.oauth.removeUserInfo({ accessToken: socket.login.accessToken });
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
module.exports = {
	io, app
};