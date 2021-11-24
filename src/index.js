global.Tumbot = {
	global:require("../tumbot.json"),
	modules:{}
};
Tumbot.global = require("../tumbot.json");
Tumbot.config = require("./api/config");
Tumbot.server = require("./api/server")
Tumbot.bot = require("./api/bot");

(async ()=>{
	Tumbot.modules = {};
	for (const module of Tumbot.config.getModules()) {
		Tumbot.modules[module] = require(`./modules/${module}`);
		console.log("[tumbot] Registered module:", module,Tumbot.modules[module]);
	}
})();