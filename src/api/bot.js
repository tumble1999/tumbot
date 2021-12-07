const { SlashCommandBuilder } = require("@discordjs/builders"),
	{ default: Collection } = require("@discordjs/collection"),
	{ Client, Intents, Interaction, MessageEmbed } = require("discord.js"),
	{ REST } = require('@discordjs/rest'),
	{ Routes } = require('discord-api-types/v9'),
	{ CommandFailedEvent } = require("mongodb"),
	{ mapAsync } = require("../util");

let
	token = Tumbot.global.discord.token,
	client = new Client({
		intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
		partials: ['MESSAGE', 'CHANNEL', 'REACTION']
	}),
	rest = new REST({ version: '9' }).setToken(token),
	clientId;


Tumbot.commands = new Collection();


client.on("ready", () => {
	log(`Logged in as ${client.user.tag}!`);
	clientId = client.user.id;
});

client.login(token);


function log(...args) {
	return console.log("[Bot]", ...args);
}
function t_throw(...args) {
	log("[Bot]", ...args);
	throw args.join(" ");
}


function getServer(id = "all") {
	if (!id || id == "all") return {};
	return client.guilds.cache.get(id);
}

function getUser(id) {
	return client.users.cache.get(id);
}
function getMember({ serverId = "all", userId }) {
	if (serverId == "all") return getUser(userId);
	return getServer(serverId).members.cache.get(userId);
}
function getChannel({ channelId }) {
	return client.channels.cache.get(channelId);
}
function getRole({ serverId, roleId }) {
	return getServer(serverId).roles.cache.get(roleId);
}

function onReady(cb) {
	if (client.isReady()) {
		cb();
	} else {
		client.on("ready", cb);
	}
}


async function onMessage(cb) {
	client.on("messageCreate", async message => {
		message.isDm = message.guild ? false : true;
		message.serverId = message.isDm ? message.channel.recipient.id : message.guild.id;
		if (message.author.bot) return;
		if (!message.tumbot) message.tumbot = {};
		if (message.tumbot.done) return;
		message.tumbot.done = await cb(message);
	});
};

async function onInteraction(cb) {
	client.on("interactionCreate", async interaction => {
		cb(interaction);
	});
};

async function ask({
	userId,
	user = getUser(userId),
	question = { prompt: "" }
} = {}) {
	if (typeof question == "string") question = { prompt: question };
	if (!user || !question || !question.prompt) return question;

	return await new Promise(resolve => {
		let messageListener = message => {
			if (
				!message.author.bot &&
				!message.guild &&
				message.author.id == user.id
			) {
				question.response = message.content;
				client.off("messageCreate", messageListener);
				resolve(question);
			}
		};

		client.on("messageCreate", messageListener);
		user.send(question.prompt);
	});
}

async function refreshCommands({ serverId = "all", commands }) {
	if (!commands) commands = (await mapAsync(
		Tumbot.commands,
		async (command, commandId) => {
			log(commandId, command);
			if (command.slash) {
				if (!command.description) command.slash.setDescription(await Tumbot.lang.parse({ serverId, id: `CMD_${commandId.toUpperCase()}_DESC`, nocode: true }));
				return command.slash.toJSON();
			}
		})).filter(cmd => void 0 != cmd);
	await rest.put(
		Routes.applicationGuildCommands(clientId, serverId),
		{ body: commands },
	);
}


async function registerCommand(moduleId, commandId, cmd = {}) {
	if (void 0 == commandId || void 0 == cmd.call) {
		t_throw("Invalid command setup:", cmd);
	}
	if (Tumbot.commands.has(commandId)) {
		log("Command already exists:", commandId);
	}
	cmd.name = commandId;
	cmd.module = moduleId;
	if (!cmd.slash) {
		cmd.slash = new SlashCommandBuilder().setName(commandId);
	}
	Tumbot.commands.set(commandId, cmd);
	log("Registered command:", cmd.module + "::" + cmd.name);
}

async function createEmbed(obj) {
	let embed = new MessageEmbed().setTimestamp();

	//embed.addField
	for(let key in obj) {
		switch (key) {
			case "title":
				embed.setTitle(obj[key])
				break;
		
			default:
				embed.addField(key,obj[key],true);
		}
	}

	return embed;
}


module.exports = {
	client,
	getServer,
	getUser,
	getMember,
	onReady,
	onMessage,
	getChannel,
	getRole,
	onInteraction,
	refreshCommands,
	registerCommand,
	ask,
	createEmbed
};