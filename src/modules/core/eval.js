const { SlashCommandBuilder } = require("@discordjs/builders");

function clean(text) {
	if (typeof (text) === "object")
		text = "```json\n" + JSON.stringify(text, null, 2).toString() + "```";
	else
		text = text.toString().replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

	return text.split(Tumbot.global.discord.token).join("*********");
}

function eval(code, context) {
	Tumbot.log("Evaluating:", code);
	return new Function(`return (${code})`).call(context);
}

function setupEval() {
	Tumbot.bot.registerCommand("core", "eval", {
		slash: new SlashCommandBuilder()
		.setName("eval")
		.addStringOption(option=>
			option.setName("code")
			.setDescription("Javascript to evaluate")
			.setRequired(true)
			),
		perms: interaction => {
			return Tumbot.global.owners.includes(interaction.author.id);
		},
		call: (interaction, args) => {
			try {
				console.log(args);
				let result = eval(args.join(" "), {
					message: interaction
				});

				//if (typeof result == "object") result = "```json\n" + JSON.stringify(result, null, 2) + "```";

				interaction.reply(clean(result), { code: "xl" });
			} catch (err) {
				interaction.reply("**ERROR**" + clean(err));
			}
		}
	});
}

module.exports = { setupEval };