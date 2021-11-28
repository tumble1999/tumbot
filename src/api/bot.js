const { Client, Intents } = require("discord.js");
let
	token = Tumbot.global.token,
	client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


client.on("ready", () => {
	log(`Logged in as ${client.user.tag}!`);
});

client.login(token);


function log(...args) {
	return console.log("[Bot]",...args);
}
function t_throw(...args) {
	log("[Bot]",...args);
	throw args.join(" ");
}


function getServer(id) {
	return client.guilds.cache.get(id);
}

function getUser(id) {
	return client.users.cache.get(id);
}
function getMember({serverId="all",userId}) {
	if(serverId=="all") return getUser(userId);
	return getServer(serverId).members.cache.get(userId);
}
function getChannel({serverId,channelId}) {
	return getServer(serverId).channels.cache.get(channelId);
}
function getRole({serverId,roleId}) {
	return getServer(serverId).roles.cache.get(roleId);
}

function onReady(cb) {
	if(client.isReady()) {
		cb();
	}else {
		client.on("ready",cb)
	}
}


async function onMessage(cb) {
	client.on("messageCreate", async message => {
		if (message.author.bot) return;
		if (!message.tumbot) message.tumbot = {};
		if (message.tumbot.done) return;
		message.tumbot.done = await cb(message);
	});
};

module.exports = {
	client,
	getServer,
	getUser,
	getMember,
	onReady,
	onMessage,
	getChannel,
	getRole
};