const MODULE_NAME = "experiments";

Tumbot.cmd.registerCommand(MODULE_NAME, "ask", {
	call: async (message, args) => {
		message.reply("Finding your DMs");

		Tumbot.bot.ask({
			user: message.author,
			question: "What is 1+1?"
		}).then(m=>{
			message.reply(
			`___**${question}**__
			*${answer}*`
			)
		});
	}
});