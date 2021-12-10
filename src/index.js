const { default: Collection } = require("@discordjs/collection");
const path = require("path");

global.Tumbot = {
	global:process.env.TUMBOT||require("../tumbot.json"),
	root: path.join(__dirname, "..")
};
if(typeof Tumbot.global=="string") Tumbot.global = JSON.parse(Tumbot.global);

Tumbot.lang = require("./api/lang");
Tumbot.bot = require("./api/bot");
Tumbot.perms = require("./api/perms");

Tumbot.config = require("./api/config");

Tumbot.server = require("./api/server");
Tumbot.oauth = require("./api/oauth");



(async ()=>{
	Tumbot.modules = new Collection();
	if(!Tumbot.global.modules||!Array.isArray(Tumbot.global.modules)||Tumbot.global.modules.length==0) {
		console.log("[Tumbot] There are no modules.");
		return;
	}
	for (const moduleId of Tumbot.global.modules) {
		let module = require(`./modules/${moduleId}`);
		Tumbot.modules.set(moduleId,module);
		console.log("[tumbot] Registered module:", moduleId,module);
	}
})();