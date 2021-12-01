const bot = require("./bot"),
	{ mapAsync } = require("../util"),
	{ connect, disconnect } = require("./db"),
	TUMBOT_DB = "tumbot",
	SERVERS_COLLECTION = "servers";
let client, CACHE = [
	{
		serverId: "all",
		modules: {
			core: {
				nickname: "Tumbot Unstable",
				prefix: "!",
				lang: "en-gb",
				commands: {
					help: true,
					ping: true,
					invite: true
				}
			},
			experiments: {
				commands: {
					ask: true
				}
			}
		}
	}
];

async function getCollection() {
	client = await connect();
	let db = client.db(TUMBOT_DB),
		collection = db.collection(SERVERS_COLLECTION);
	return collection;
}
async function closeDB() {
	await disconnect(client);
}

async function getServers() {
	if (Tumbot.global.servers) {
		return Tumbot.global.servers;
	}

	// get DM if cache is empty
	if (CACHE.length < 2) {
		console.log("[config] Connecting to db to get servers");
		let collection = await getCollection(),
			servers = await collection.find({}, {}).toArray();
		if (servers.length > 1) CACHE = servers;
		await closeDB();
	}
	let imgOptions = { dynamic: true, size: 16, format: "png" };

	return Object.values(CACHE).map(server => {
		let guild;
		if (server.serverId == "all") {
			return {
				serverId: "all",
				name: "Tumbot"
			};
		} else if (server.dm) {
			guild = bot.getUser(server.serverId);
		} else {
			guild = bot.getServer(server.serverId);
		}
		return {
			serverId: server.serverId,
			name: server.dm ? ("@" + guild.tag) : guild.name,
			icon: server.dm ? guild.displayAvatarURL(imgOptions) : guild.iconURL(imgOptions),
			banner: guild.bannerURL ? guild.bannerURL(imgOptions) : null,
			splash: guild.splashURL ? guild.splashURL(imgOptions) : null
		};
	});
}

async function getServer({ message, serverId = "all", dm = false } = {}) {
	if (Tumbot.global.servers && Tumbot.global.modules && Array.isArray(Tumbot.global.modules) && typeof Tumbot.global.modules[0] !== "string") return Tumbot.global;
	if (message) serverId = message.guild.id;

	//Get From Cache
	let server = CACHE.find(server => server.serverId == serverId);
	if (!server && serverId == "all") {
		console.log("This is bad");
	}

	if (!server) {
		//Get From DB
		console.log("[config] Connecting to db to get a server");
		let collection = await getCollection();
		server = await collection.findOne({ serverId });
		await closeDB();
	}

	if (!server) {
		if (serverId != "all" && void 0 != message) {
			dm = message.isDm;
		}
		server = {
			serverId: serverId, dm
		};

		// add server to db
		console.log("[config] Connecting to database to add a server");
		let collection = await getCollection();
		await collection.insertOne(server);
		await closeDB();

		// Add db to cache
		CACHE.push(server);
		console.log("[config] Registered server: " + serverId);
	}
	return server;
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
		serverUsers = await getServer().users || [];
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
		let serverMembers = await getServer({ serverId }).users;
		if (serverMembers)
			users = users.concat(serverMembers.map(user => {
				user.role = 12;
				return user;
			}));
	}
	return users;
}

async function getModules(serverId = "all") {
	let modules = Tumbot.modules;
	return mapAsync(Object.keys(modules), moduleId => {
		let module = modules[moduleId],
			config = getModule({ serverId, moduleId });
		return {
			moduleId: moduleId,
			//name: Tumbot.lang.parse({ serverId, id: "MODULE_" + moduleId.toUpperCase() + "_NAME" }),
			//description: Tumbot.lang.parse({ serverId, id: "MODULE_" + moduleId.toUpperCase() + "DESCRIPTION" }),
			dm: module.dm || false,
			active: config ? true : false
		};
	});
	//return Object.keys(await getServer({ serverId }).modules || {});
}

async function getModule({ message, serverId, moduleId, dm }) {
	if (message) serverId = message.guild.id;
	let server = await getServer({ message, serverId, dm }),
		global = await getServer();
	if (!server.modules) server.modules = {};
	if (!global.modules) global.modules = {};
	let module = server.modules[moduleId] || {};
	module = Object.assign({}, global.modules[moduleId] || {},
		typeof module == "object" ? module : {}
	);
	return module;
}

async function updateModule({ serverId, moduleId, moduleConfig, message, dm }) {
	let server = await getServer({ serverId, message, dm });

	//Update Cache
	if (moduleId) {
		if (!server.modules) server.modules = {};
		server.modules[moduleId] = moduleConfig;
	}

	//Update DB
	console.log("[config] Connecting to db update settings");
	let collection = await getCollection();
	if (!await collection.findOne({ serverId })) {
		await collection.insertOne(server);
	} else {
		await collection.replaceOne({ serverId }, server);
	}
	await closeDB();
}


module.exports = {
	getServers,
	getUsers,
	getModules,
	getModule,
	updateModule
};