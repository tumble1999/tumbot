const bot = require("./bot");
let db = [
	{
		id: "all",
		modules:{
			core:{
				nickname:"Tumbot Unstable",
				prefix:"!",
				lang:"en-gb",
				commands:{
					help:true,
					ping:true,
					invite:true
				}
			},
		}
	}
];

async function getServers() {
	if (Tumbot.global.servers) {
		return Tumbot.global.servers;
	}

	let imgOptions={dynamic:true,size:16,format:"png"},
	servers =  [
		// ...(await Tumbot.bot.client.guilds.fetch()).map(guild => {
		// 	console.log(guild.name);
		// 	return {
		// 	id:guild.id,
		// 	name: guild.name,
		// 	acronym:guild.nameAcronym,
		// 	icon:guild.iconURL?guild.iconURL(imgOptions):null,
		// 	banner:guild.bannerURL?guild.bannerURL(imgOptions):null,
		// 	splash:guild.splashURL?guild.splashURL(imgOptions):null
		// }}),
		...Object.values(db).map(server=>{
			let guild;
			if(server.id=="all"){
				return {
					id:"all",
					name:"Tumbot"
				}
			} else if(server.dm) {
				guild = bot.getUser(server.id);
			}else {
				guild = bot.getServer(server.id)
			}
			return {
				id: guild.id,
				name: server.dm?("@"+guild.tag):guild.name,
				icon:server.dm?guild.displayAvatarURL(imgOptions):guild.iconURL(imgOptions),
				//banner:guild.bannerURL?guild.bannerURL(imgOptions):null,
				//splash:guild.splashURL?guild.splashURL(imgOptions):null
			}
		})
	];

	return servers;
}

function getServer({message,serverId = "all",dm=false}={}) {
	if (Tumbot.global.modules) return Tumbot.global;
	let server = db.find(server => server.id == serverId);

	
	if (!server) {
		if(serverId!="all"&& void 0 !=message){
			dm = message.isDm;
		}
		server = {
			id: serverId,dm
		};

		db.push(server);
		console.log("Registered server: " + serverId);
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
		let serverMembers = getServer({serverId}).users;
		if (serverMembers)
			users = users.concat(serverMembers.map(user => {
				user.role = 12;
				return user;
			}));
	}
	return users;
}

function getModules({serverId}={}) {
	return Object.keys(getServer({serverId}).modules || {});
}

function getModule({message, serverId, moduleId ,dm}) {
	let server = getServer({message,serverId,dm});
	if(!server.modules)server.modules = {};
	let module = server.modules[moduleId] || {};
	module = Object.assign({}, getServer().modules[moduleId],
		typeof module == "object" ? module : {}
	);
	return module;
}

function updateModule({ serverId, moduleId, moduleConfig,message,dm }) {
	getServer({serverId,message,dm}).modules[moduleId] = moduleConfig;
}


module.exports = {
	getServers,
	getUsers,
	getModules,
	getModule,
	removeServer,
	updateModule
};