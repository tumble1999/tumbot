const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, Permissions } = require("discord.js");
const { mapAsync, filterAsync } = require("../../util");
const { setupEval } = require("./eval");

const MODULE_NAME = "core";


Tumbot.bot.onReady(() => {
	let servers = Tumbot.bot.client.guilds.cache.map(g => g.id);
	console.log("[" + MODULE_NAME + "] servers", servers);
	servers.forEach(async serverId => {
		let config = await Tumbot.config.getModule({ serverId, moduleId: MODULE_NAME, dm: false });
		console.log("[" + MODULE_NAME + "]", serverId, config);

		updateConfig(serverId, config);
		Tumbot.bot.refreshCommands({ serverId });
	});
	//Tumbot.bot.refreshCommands();
});

Tumbot.bot.client.on("guildCreate", async guild => {
	let serverId = guild.id,
	config = await Tumbot.config.getModule({ serverId, moduleId: MODULE_NAME, dm: false });
	console.log("[" + MODULE_NAME + "]", serverId, config);

	updateConfig(serverId, config);
	Tumbot.bot.refreshCommands({ serverId });

});
Tumbot.bot.client.on("guildDelete", async guild => {

});

function updateConfig(serverId, moduleConfig) {
	if (!moduleConfig) return;
	if (serverId == "all") return;
	let member = Tumbot.bot.getMember({ serverId, userId: Tumbot.bot.client.user.id });

	//Nickname
	if (moduleConfig.nickname) member.setNickname(moduleConfig.nickname, "Bot Web Panel");
}

Tumbot.bot.registerCommand(MODULE_NAME, "help", {
	call: async (message, args) => {
		let commands = Tumbot.commands,
			{ serverId } = message,
			config = await Tumbot.config.getModule({ message, serverId, moduleId: MODULE_NAME }),
			list = (await mapAsync(
				commands,
				async (command, commandId) => {
					if (!await Tumbot.perms.hasPerm({ message, commandId, moduleId: command.module })) return;
					let prefix = message.webhook ? "/" : config.prefix,
						description = await Tumbot.lang.parse({ config, id: `CMD_${commandId.toUpperCase()}_DESC`, nocode: true }),
						module = await Tumbot.lang.parse({ config, id: `MODULE_${command.module.toUpperCase()}_NAME`, nocode: true }),
						args = void 0 == command.args
							? []
							: await mapAsync(command.args, async arg => {
								arg = await Tumbot.lang.parse({ config, id: `CMD_${commandId.toUpperCase()}_ARG_${arg.toUpperCase()}`, nocode: true });
								return !arg.includes("(")
									? `[${arg}]`
									: arg;
							});
					return `${prefix}${commandId}${(args.length > 0 ? " " : "")}${args.join(" ")} - [${module}] ${description}`;
				})).filter(cmd => void 0 != cmd),
			header = await Tumbot.lang.parse({ config, id: "HELP_HEADER" }),
			footer = await Tumbot.lang.parse({ config, id: "HELP_FOOTER" });


		let inviteLink = Tumbot.bot.getBotInviteLink();

		const buttons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setStyle("LINK")
					.setLabel('Web Panel')
					.setURL(Tumbot.global.webpanel),
			)
			.addComponents(
				new MessageButton()
					.setStyle("LINK")
					.setLabel('Add to Server')
					.setURL(inviteLink),
			);


		message.replyExclusive({
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



Tumbot.bot.registerCommand(MODULE_NAME, "ping", {
	call: async interaction => {
		if (void 0 != interaction.interaction) return interaction.reply(await Tumbot.lang.parse({ serverId: interaction.guildId, id: "PING_NOT_AVAILABLE" }));
		interaction.reply(await Tumbot.lang.parse({ serverId: interaction.guildId, id: "PING_RESPONSE", macros: { PING: Date.now() - interaction.createdTimestamp } }));
	}
});

Tumbot.bot.registerCommand(MODULE_NAME, "echo", {
	slash: new SlashCommandBuilder()
	.setName("echo")
	.addStringOption(option=>
		option.setName("text")
		.setDescription("Text to repeat")
		.setRequired(true)
		),
	call: async interaction => {
		return interaction.reply(interaction.options.getString("text"));
	}
});

setupEval();

Tumbot.bot.onInteraction(async interaction => {
	if (interaction.isCommand()) {

		console.log("hmm");
		let reply = interaction.reply;
		interaction.author = interaction.user;
		interaction.reply = (...args) => (interaction.replied ? interaction.followUp : reply).call(interaction, ...args);
		interaction.replyExclusive = (args) =>{
			if(typeof args=="object") {
				args.ephemeral = true
				interaction.reply.call(interaction,args)
			}else {
				interaction.reply.call(interaction,{
					content:args,
					ephemeral:true
				})
			}
		}

		let command = Tumbot.commands.get(interaction.commandName);
		if (!command || !command.call || !await Tumbot.perms.hasPerm({ message: interaction, commandId: interaction.commandName, moduleId: command.module })) return false;
		console.log("[" + MODULE_NAME + "]", `Calling command: ${interaction.commandName} - [${interaction.options.data.join(",")}]`);
		command.call(interaction);
		return true;

	}
});

module.exports = {
	updateConfig
};