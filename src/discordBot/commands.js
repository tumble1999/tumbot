

function hasPerms(member, perms) {
	if (typeof perms === "function") return perms(member);
	if (!perms) perms = "ADMINISTRATOR";
	return member.permissions.has(perms, { checkAdmin: true, checkOwner: true });
}

function isEnabled(config, command, cmd = command.name) {
	return Object.keys(config).includes(command.module)
		&& config[command.module].commands && config[command.module].commands[cmd];
}

async function parseCommand(message, config) {
	let content = message.content;
	if (content.substr(0, config.discordBot.prefix.length) !== config.discordBot.prefix) return false;
	content = content.substr(config.discordBot.prefix.length, content.length);
	if (!content) return false;
	let args = content.split(" "),
		name = args.shift();
	if (!name)
		return false;
	let cmd = Tumbot.commands[name];
	if (!cmd || !cmd.call || !hasPerms(message.member, cmd.perms) || !isEnabled(config, cmd)) return false;
	Tumbot.log(`Calling command: ${name} - [${args.join(",")}]`);
	await cmd.call(message, args, config);
	return true;
}

function registerCommand(module, name, cmd = {}) {
	if (void 0 == name || void 0 == cmd.call) {
		Tumbot.log("Invalid command setup:", cmd);
		return;
	}
	if (void 0 != Tumbot.commands[name]) {
		Tumbot.log("Command already exists:", name);
	}
	cmd.name = name;
	cmd.module = module;
	Tumbot.commands[name] = cmd;
	Tumbot.log("Registered command:", module + "::" + name);
}

module.exports = { parseCommand, registerCommand, hasPerms, isEnabled };