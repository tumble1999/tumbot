module.exports = (config) => {

	Tumbot.modules.discordBot.registerCommand("test", "hello", {
		call: function (message, [name], config) {
			message.channel.send(`Hello World!`);
		}
	});

	return {};
}