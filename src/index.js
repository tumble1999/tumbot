global.Tumbot = {
	global: require("../tumbot.json")
};

require("./api/server")
Tumbot.bot = require("./api/discordBot");