const { mapAsync, filterAsync } = require("../../util");
const { setupEval } = require("./eval");

const MODULE_NAME="core";


Tumbot.bot.onReady(() => {
	let servers = Tumbot.bot.client.guilds.cache.map(g => g.id);
	console.log("["+MODULE_NAME+"] servers", servers);
	servers.forEach(serverId => {
		let config = Tumbot.config.getModule({ serverId, moduleId: MODULE_NAME });
		console.log("["+MODULE_NAME+"]",serverId, config);

		updateConfig(serverId, config);
	});
});

function updateConfig(serverId, moduleConfig) {
	if(!moduleConfig) return;
	if (serverId == "all") return;
	let member = Tumbot.bot.getMember({ serverId, userId: Tumbot.bot.client.user.id });

	//Nickname
	if (moduleConfig.nickname) member.setNickname(moduleConfig.nickname, "Bot Webpanel");
}

Tumbot.cmd.registerCommand(MODULE_NAME,"help",{
	call: async (message, args) => {
		let commands = Tumbot.commands,
		config = Tumbot.config.getModule({serverId:message.guild.id,moduleId:MODULE_NAME}),
		list = (await mapAsync(
			Object.keys(commands),
			async cmd => {
				if(!await Tumbot.perms.hasPerm({message,command:cmd,moduleId:MODULE_NAME})) return
				let description = await Tumbot.lang.parse({config, id:`CMD_${cmd.toUpperCase()}_DESC`, nocode:true}),
				module = await Tumbot.lang.parse({config, id:`MODULE_${commands[cmd].module.toUpperCase()}_NAME`, nocode:true}),
				args = void 0 == commands[cmd].args
					? []
					: await mapAsync(commands[cmd].args, async arg => {
						arg = await Tumbot.lang.parse({config, id:`CMD_${cmd.toUpperCase()}_ARG_${arg.toUpperCase()}`,  nocode:true});
						return !arg.includes("(")
							? `[${arg}]`
							: arg;
					});
				return `${config.prefix}${cmd}${(args.length > 0 ? " " : "")}${args.join(" ")} - [${module}] ${description}`;
			})).filter(cmd=>void 0 != cmd),
			header = await Tumbot.lang.parse({config, id:"HELP_HEADER"}),
			footer = await Tumbot.lang.parse({config, id:"HELP_FOOTER"});
		message.reply(
			header +
			"\n```" +
			(list.length == 0
				? Tumbot.lang.parse({config, id:"HELP_EMPTY"})
				: list.join("\n")) +
			"```" + footer
		);
	}
})
Tumbot.cmd.registerCommand(MODULE_NAME,"ping",{
	call:async (message, args) => {
		if (void 0 != message.interaction) return message.reply(await Tumbot.lang.parse({serverId:message.guildId, id:"PING_NOT_AVAILABLE"}));
		message.reply(await Tumbot.lang.parse({serverId:message.guildId, id:"PING_RESPONSE", macros:{ PING: Date.now() - message.createdTimestamp }}));

	}
})

setupEval();


Tumbot.bot.onMessage(async message=>{
	let config = Tumbot.config.getModule({serverId:message.guild.id,moduleId:MODULE_NAME}),
	content = message.content,
	prefix = config.prefix;
	if(!prefix) return false;
	if(content.substr(0,prefix.length)!==prefix) return false;
	content = content.substr(prefix.length, content.length);
	if (!content) return false;
	let args = content.split(" "),
		name = args.shift();
	if (!name)
		return false;
	let cmd = Tumbot.commands[name];
	if (!cmd || !cmd.call||!await Tumbot.perms.hasPerm({message,command:name,moduleId:MODULE_NAME})) return false;
	console.log("["+MODULE_NAME+"]",`Calling command: ${name} - [${args.join(",")}]`);
	cmd.call(message,args);
	return true;
})

module.exports = {
	updateConfig
};