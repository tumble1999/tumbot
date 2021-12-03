const path = require("path");

global.Tumbot = {
	global:process.env.TUMBOT||require("../tumbot.json"),
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
	if(!Tumbot.global.modules||!Array.isArray(Tumbot.global.modules)||Tumbot.global.modules.length==0) {
		console.log("[Tumbot] There are no modules.");
		return;
	}
	for (const module of Tumbot.global.modules) {
		Tumbot.modules[module] = require(`./modules/${module}`);
		console.log("[tumbot] Registered module:", module,Tumbot.modules[module]);
	}
})();