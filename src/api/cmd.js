function log(...args) {
	return console.log("[Commands]",...args);
}
function t_throw(...args) {
	log(...args);
	throw args.join(" ");
}

async function registerCommand(moduleId,name,cmd={}) {
	if (void 0 == name || void 0 == cmd.call) {
		t_throw("Invalid command setup:", cmd);
	}
	if(!Tumbot.commands) Tumbot.commands = {};
	if (void 0 != Tumbot.commands[name]) {
		log("Command already exists:", name);
	}
	cmd.name = name;
	cmd.module = moduleId;
	Tumbot.commands[name] = cmd;
	log("Registered command:", cmd.module + "::" + cmd.name);
}

module.exports = {registerCommand};