const { MessageActionRow, MessageButton } = require("discord.js");
const { mapAsync, filterAsync } = require("../../util");
const { setupEval } = require("./eval");

const MODULE_NAME = "core";


Tumbot.bot.onReady(() => {
	let servers = Tumbot.bot.client.guilds.cache.map(g => g.id);
	console.log("[" + MODULE_NAME + "] servers", servers);
	servers.forEach(serverId => {
		let config = Tumbot.config.getModule({ serverId, moduleId: MODULE_NAME, dm: false });
		console.log("[" + MODULE_NAME + "]", serverId, config);

		updateConfig(serverId, config);
	});
});

function updateConfig(serverId, moduleConfig) {
	if (!moduleConfig) return;
	if (serverId == "all") return;
	let member = Tumbot.bot.getMember({ serverId, userId: Tumbot.bot.client.user.id });

	//Nickname
	if (moduleConfig.nickname) member.setNickname(moduleConfig.nickname, "Bot Web Panel");
}

Tumbot.cmd.registerCommand(MODULE_NAME, "help", {
	call: async (message, args) => {
		let commands = Tumbot.commands,
			config = Tumbot.config.getModule({ message, serverId: message.serverId, moduleId: MODULE_NAME }),
			list = (await mapAsync(
				Object.keys(commands),
				async cmd => {

					if (!await Tumbot.perms.hasPerm({ message, command: cmd, moduleId: commands[cmd].module })) return;
					let description = await Tumbot.lang.parse({ config, id: `CMD_${cmd.toUpperCase()}_DESC`, nocode: true }),
						module = await Tumbot.lang.parse({ config, id: `MODULE_${commands[cmd].module.toUpperCase()}_NAME`, nocode: true }),
						args = void 0 == commands[cmd].args
							? []
							: await mapAsync(commands[cmd].args, async arg => {
								arg = await Tumbot.lang.parse({ config, id: `CMD_${cmd.toUpperCase()}_ARG_${arg.toUpperCase()}`, nocode: true });
								return !arg.includes("(")
									? `[${arg}]`
									: arg;
							});
					return `${config.prefix}${cmd}${(args.length > 0 ? " " : "")}${args.join(" ")} - [${module}] ${description}`;
				})).filter(cmd => void 0 != cmd),
			header = await Tumbot.lang.parse({ config, id: "HELP_HEADER" }),
			footer = await Tumbot.lang.parse({ config, id: "HELP_FOOTER" });

		const buttons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setStyle("LINK")
					.setLabel('Web Panel')
					.setURL("http://localhost:4000"),
			);


		message.reply({
			content:
				header +
				"\n```" +
				(list.length == 0
					? Tumbot.lang.parse({ config, id: "HELP_EMPTY" })
					: list.join("\n")) +
				"```" + footer,
			components: [buttons]
		});
	}
});
Tumbot.cmd.registerCommand(MODULE_NAME, "ping", {
	call: async (message, args) => {
		if (void 0 != message.interaction) return message.reply(await Tumbot.lang.parse({ serverId: message.guildId, id: "PING_NOT_AVAILABLE" }));
		message.reply(await Tumbot.lang.parse({ serverId: message.guildId, id: "PING_RESPONSE", macros: { PING: Date.now() - message.createdTimestamp } }));

	}
});

Tumbot.cmd.registerCommand(MODULE_NAME, "invite", {
	call: async (message, args) => {
		let perms = 3072,
			link = "https://discord.com/oauth2/authorize?client_id=" + message.client.user.id + "&scope=bot&permissions=" + perms;
		message.reply("To add me to your own server click this link: " + link);
	}
});

setupEval();


Tumbot.bot.onMessage(async message => {
	let config = Tumbot.config.getModule({ message, serverId: message.serverId, moduleId: MODULE_NAME }),
		content = message.content,
		prefix = config.prefix;
	if (!prefix) return false;
	if (content.substr(0, prefix.length) !== prefix) return false;
	content = content.substr(prefix.length, content.length);
	if (!content) return false;
	let args = content.split(" "),
		name = args.shift();
	if (!name)
		return false;
	let cmd = Tumbot.commands[name];
	if (!cmd || !cmd.call || !await Tumbot.perms.hasPerm({ message, command: name, moduleId: cmd.module })) return false;
	console.log("[" + MODULE_NAME + "]", `Calling command: ${name} - [${args.join(",")}]`);
	cmd.call(message, args);
	return true;
});

module.exports = {
	updateConfig
};