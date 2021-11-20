const { Client, Intents } = require("discord.js");

let
	token = Tumbot.global.token,
	client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


client.on("ready", () => {
	console.log(`[discordBot] Logged in as ${client.user.tag}!`);
});

client.login(token);

module.exports = {};