function clean(text) {
	if (typeof (text) === "object")
		text = "```json\n" + JSON.stringify(text, null, 2).toString() + "```";
	else
		text = text.toString().replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

	return text.split(Tumbot.global.token).join("*********");
}

function eval(code, context) {
	Tumbot.log("Evaluating:", code);
	return new Function(`return (${code})`).call(context);
}

function setupEval() {
	Tumbot.cmd.registerCommand("core", "eval", {
		perms: message => {
			return Tumbot.global.owners.includes(message.author.id);
		},
		call: (message, args) => {
			try {
				console.log(args);
				let result = eval(args.join(" "), {
					message
				});

				//if (typeof result == "object") result = "```json\n" + JSON.stringify(result, null, 2) + "```";

				message.reply(clean(result), { code: "xl" });
			} catch (err) {
				message.reply("**ERROR**" + clean(err));
			}
		}
	});
}

module.exports = { setupEval };