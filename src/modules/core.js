
Tumbot.bot.onReady(() => {
	let servers = Tumbot.bot.client.guilds.cache.map(g => g.id);
	console.log("servers", servers);
	servers.forEach(serverId => {
		let config = Tumbot.config.getModule({ serverId, moduleId: "core" });
		console.log(serverId, config);

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

module.exports = {
	updateConfig
};