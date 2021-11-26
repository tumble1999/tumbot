const bot = require("./bot");
let db = [
	{
		id: "all",
		users: [
			{
				id: "12345",
				type: "user", //user,role
			}
		],
		modules: {
			core: {
				test: ""
			}
		}
	}
];

async function getServers() {
	if (Tumbot.global.servers) {
		return Tumbot.global.servers;
	}

	return [...new Set([
		...db.map(s => s.id),
		...(await Tumbot.bot.client.guilds.fetch()).map(s => s.id)
	])];
}

function getServer(id = "all") {
	if (Tumbot.global.modules) return Tumbot.global;
	let server = db.find(server => server.id == id);
	if (!server) {
		server = {
			id,
			users: [],
			modules: {}
		};
		db.push(server);
	}
	return server;
}

function removeServer(id) {
	db = db.filter(server => server.id != id);
}

function getOwners() {
	let owners = Tumbot.global.owners;
	return owners ? owners.map(id => ({
		id,
		type: "user",
		role: 0
	})) : [];
}

async function getUsers(serverId = "all") {
	/*
	Roles:
	0 Bot Owner (Red)
	1 Bot Admin (Orange)

	10 Server Owner (Yellow)
	11 Server Admin (Green)
	12 Server Bot Manager (Blue)

	*/
	let users = getOwners(),
		serverUsers = getServer().users || [];
	users = users.concat(serverUsers.map(user => {
		user.role = 1;
		return user;
	}));
	if (serverId != "all") {
		let serverOwner = await bot.getServer(serverId).fetchOwner();
		users.push({
			id: serverOwner.userId,
			name: serverOwner.displayName,
			type: "user",
			role: 10
		});
		let serverMembers = getServer(serverId).users;
		if (serverMembers)
			users = users.concat(serverMembers.map(user => {
				user.role = 12;
				return user;
			}));
	}
	return users;
}

function getModules(serverId) {
	return Object.keys(getServer(serverId).modules || {});
}

function getModule({ serverId, moduleId }) {
	let module = getServer(serverId).modules[moduleId] || {};
	module = Object.assign({}, getServer().modules[moduleId],
		typeof module == "object" ? module : {}
	);
	return module;
}

function updateModule({ serverId, moduleId, moduleConfig }) {
	getServer(serverId).modules[moduleId] = moduleConfig;
}


module.exports = {
	getServers,
	getUsers,
	getModules,
	getModule,
	removeServer,
	updateModule
};