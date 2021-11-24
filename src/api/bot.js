const { Client, Intents } = require("discord.js");

let
	token = Tumbot.global.token,
	client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


client.on("ready", () => {
	console.log(`[discordBot] Logged in as ${client.user.tag}!`);
});

client.login(token);

function getServer(id) {
	return client.guilds.cache.get(id);
}

function getUser(id) {
	return client.users.cache.get(id);
}
function getMember({serverId,userId}) {
	return getServer(serverId).members.cache.get(userId);
}

function onReady(cb) {
	if(client.isReady()) {
		cb();
	}else {
		client.on("ready",cb)
	}
}

module.exports = {
	client,
	getServer,
	getUser,
	getMember,
	onReady
};