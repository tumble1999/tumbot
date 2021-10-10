//Config
const path = require("path");
global.Tumbot = {
	global: require("../tumbot.json"),
	modules: {},
	guilds: {},
	commands: {},
	log: (...args) => console.log("[tumbot]", ...args),
	root: path.join(__dirname, ".."),
	require: id => require.main.require(id),
	getFile: id => require(path.join(Tumbot.root, id))
};
(async () => {
	for (const module in Tumbot.global) {
		Tumbot.modules[module] = await require(`./${module}`)(Tumbot.global[module]);
		Tumbot.log("Registered module:", module);
	}
})();