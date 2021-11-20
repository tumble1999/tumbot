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
				prefix: "!",
				commands: {
					help: [
						{
							id: "12345",
							type: "role" //user, role, channel
						}
					]
				}
			},
			test: {

			}
		}
	},
	{
		id: "123",
		users: [
			{
				id: "67890",
				type: "user"
			}
		],
		modules: { core: { prefix: "?" } }
	},
	{
		id: "456"
	}
];

function getServers() {
	return db.map(server => server.id);
}

function getServer(id = "all") {
	let server = db.find(server => server.id == id);
	return server;
}

function getOwner() {
	return {
		id: Tumbot.global.owner,
		type: "user",
		role: 0
	};
}

function getUsers(serverId = "all") {
	let users = [getOwner()];
	users = users.concat(getServer().users.map(user => {
		user.role = 1;
		return user;
	}));
	if (serverId != "all") {
		users = users.concat(getServer(serverId).users.map(user => {
			user.role = 11;
			return user;
		}));
	}
	return users;
}

function getModules(serverId) {
	return Object.keys(getServer(serverId).modules || {});
}

function getModule(serverId, moduleId) {
	let module = getServer(serverId).modules[moduleId];
	if (module) {
		module = Object.assign({}, getServer().modules[moduleId],
			typeof module == "object" ? module : {}
		);
	}
	return module;
}

module.exports = {
	getServers,
	getServer,
	getUsers,
	getModules,
	getModule
};