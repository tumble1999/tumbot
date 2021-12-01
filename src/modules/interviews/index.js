const MODULE_NAME = "interviews";

Tumbot.cmd.registerCommand(MODULE_NAME, "apply", {
	call: async (message, args) => {
		message.reply("Finding your DMs");
		message.author.send("This should be your DMs");
		Tumbot.bot.ask({
			user: message.author,
			question: "What is 1+1?"
		}).then(console.log);
	}
});