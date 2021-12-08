const MODULE_NAME = "experiments";

Tumbot.bot.registerCommand(MODULE_NAME, "ask", {
	call: async interaction => {
		interaction.reply("Finding your DMs");

		Tumbot.bot.ask({
			user: interaction.author,
			question: "What is 1+1?"
		}).then((question)=>{
			interaction.reply(
`___**${question.prompt}**__
${question.response}*`
			)
		});
	}
});

Tumbot.bot.registerCommand(MODULE_NAME,"embed",{
	call: async interaction=>{
		interaction.reply({
			embeds:[
				await Tumbot.bot.createEmbed({a:"b",c:"d"})
			]
		})
	}
})