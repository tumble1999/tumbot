const path = require("path");

global.Tumbot = {
	global:require("../tumbot.json"),
	root: path.join(__dirname, "..")
};
Tumbot.global = require("../tumbot.json");
Tumbot.config = require("./api/config");
Tumbot.lang = require("./api/lang");
Tumbot.server = require("./api/server");
Tumbot.bot = require("./api/bot");
Tumbot.cmd = require("./api/cmd");
Tumbot.perms = require("./api/perms");



(async ()=>{
	Tumbot.modules = {};
	for (const module of Tumbot.config.getModules()) {
		Tumbot.modules[module] = require(`./modules/${module}`);
		console.log("[tumbot] Registered module:", module,Tumbot.modules[module]);
	}
})();