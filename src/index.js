const path = require("path");

global.Tumbot = {
	global:process.env.TUMBOT||require("../tumbot.json"),
	root: path.join(__dirname, "..")
};
if(typeof Tumbot.global=="string") Tumbot.global = JSON.parse(Tumbot.global);
Tumbot.config = require("./api/config");
Tumbot.lang = require("./api/lang");
Tumbot.server = require("./api/server");
Tumbot.bot = require("./api/bot");
Tumbot.cmd = require("./api/cmd");
Tumbot.perms = require("./api/perms");
Tumbot.oauth = require("./api/oauth");



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