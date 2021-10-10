const { Client, Intents } = require("discord.js");
const { LANG, LANG_LIST, LANG_TIME } = require("./languages");
const { registerCommand, parseCommand, hasPerms, isEnabled } = require("./commands");
const { setupEval } = require("./eval");


function mapAsync(array, func, context) {
	return Promise.all(array.map(func, context));
}

module.exports = async function (config) {
	if (!config.token) {
		Tumbot.log("Please specify a discord app token in tumbot.json");
	}
	if (void 0 != config.servers) config.guilds = config.servers;
	let client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
	let registerGuild = guild => {
		if (void 0 !== config.guilds && !config.guilds.includes(guild.id)) {
			guild.leave();
			return;
		}
		guild.tumbot = Tumbot.guilds[guild.id] = Object.assign({}, Tumbot.global);
		Tumbot.log(`Registered guild: ${guild.name} (${guild.id})`);

	};
	let onMessage = async cb => {
		client.on("messageCreate", async message => {
			if (message.author.bot) return;
			if (!message.tumbot) message.tumbot = {};
			if (message.tumbot.done) return;
			message.tumbot.done = await cb(message, message.guild.tumbot);

		});
	};

	client.on("ready", () => {
		Tumbot.log(`Logged in as ${client.user.tag}!`);
		client.guilds.cache.each(registerGuild);
	});

	client.on("guildCreate", registerGuild);

	client.login(config.token);
	delete config.token;

	registerCommand("discordBot", "help", {
		call: async (message, args) => {
			let commands = Tumbot.commands;
			let config = message.guild.tumbot;
			let list = await mapAsync(
				Object.keys(commands).filter(
					cmd => isEnabled(config, commands[cmd])
						&& hasPerms(message.member, commands[cmd].perms)
				),
				async cmd => {
					let description = await LANG(config, `CMD_${cmd.toUpperCase()}_DESC`, {}, true);
					let args = void 0 == commands[cmd].args
						? []
						: await mapAsync(commands[cmd].args, async arg => {
							arg = await LANG(config, `CMD_${cmd.toUpperCase()}_ARG_${arg.toUpperCase()}`, {}, true);
							return !arg.includes("(")
								? `[${arg}]`
								: arg;
						});
					return `${config.discordBot.prefix}${cmd}${(args.length > 0 ? " " : "")}${args.join(" ")} - ${description}`;
				}),
				header = await LANG(config, "HELP_HEADER"),
				footer = await LANG(config, "HELP_FOOTER");
			message.reply(
				header +
				"\n```" +
				(list.length == 0
					? LANG(config, "HELP_EMPTY")
					: list.join("\n")) +
				"```" + footer
			);
		}
	});

	registerCommand("discordBot", "ping", {
		call: async (message, args) => {
			if (void 0 != message.interaction) return message.reply(await LANG(message.guild.id, "PING_NOT_AVAILABLE"));
			message.reply(await LANG(message.guildId, "PING_RESPONSE", { PING: Date.now() - message.createdTimestamp }));

		}
	});

	onMessage(parseCommand);
	setupEval();

	let module = {
		LANG, LANG_LIST, LANG_TIME, client, onMessage, registerCommand
	};

	return module;
};