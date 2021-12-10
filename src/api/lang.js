const fs = require('fs').promises,
{getModule} = require("./config");

let LANG_FOLDER = Tumbot.root + "/lang";

function log(...args) {
	console.log("[lang]", ...args);
}

function getLang(lang) {
	return require(`${LANG_FOLDER}/${lang}.json`);
}

async function listLang() {
	let list = await (await fs.readdir(LANG_FOLDER + "/")).map(l => {
		let parts = l.split(".");
		parts.pop();
		return parts.join(".");
	});
	return list;
}


async function parse({ serverId, config, id, macros = {}, nocode }) {
	if (void 0 == config) config = await getModule({ serverId, moduleId: "core" });
	if (!config.lang) config.lang = "en-gb";
	let langFile = getLang(config.lang);

	if (!langFile[id]) return nocode ? id : "`" + id + "`";
	let text = langFile[id].split("\\n").join("\n");;
	for (const macro in macros) {
		let value = macros[macro];
		if (typeof (value) == "function") value = await value();
		text = text.split("$" + macro).join(value);
	}
	log(`[${config.lang}] ${id}: ${text}`);
	return text || "";
}

async function timeSince({ serverId, config, date }) {
	let seconds = Math.floor((new Date() - date) / 1000);
	let interval = seconds / 31536000;
	let output = {};

	if (interval > 1) {
		output.YEARS_VALUE = Math.floor(interval);
	}
	interval = (seconds / 2592000) % 12;
	if (interval > 1) {
		output.MONTHS_VALUE = Math.floor(interval);
	} else {
		interval = seconds / 86400;
		if (interval > 1) {
			output.DAYS_VALUE = Math.floor(interval);
		}
	}
	if (Object.keys(output).length > 0) {
		//return "hmm" + " ago"
		Object.assign(output, {
			YEARS_LABEL: (output.YEARS_VALUE == 1 ? await parse({ serverId, id: "TIME_YEARS_LABEL_SINGULAR" }) : await parse({ serverId, id: "TIME_YEARS_LABEL_PLURAL" })),
			MONTHS_LABEL: (output.MONTHS_VALUE == 1 ? await parse({ serverId, id: "TIME_MONTHS_LABEL_SINGULAR" }) : await parse({ serverId, id: "TIME_MONTHS_LABEL_PLURAL" })),
			DAYS_LABEL: (output.DAYS_VALUE == 1 ? await parse({ serverId, id: "TIME_DAYS_LABEL_SINGULAR" }) : await parse({ serverId, id: "TIME_DAYS_LABEL_PLURAL" }))
		});
		return await parse({ serverId, config, id: "TIME_SINCE_" + (output.YEARS_VALUE ? "Y" : "") + (output.MONTHS_VALUE ? "M" : "") + (output.DAYS_VALUE ? "D" : ""), output });

	} else {
		return await parse({ serverId, config, id: "TIME_TODAY" });
	}
}

async function parseTime({ serverId, config, dateInfo }) {
	let monthNames = await Promise.all(new Array(26).fill("").map(async (_, n) => (await parse({ serverId, id: "TIME_MONTH_" + n })))),
		dayNames = await Promise.all(new Array(6).fill("").map(async (_, n) => (await parse({ serverId, id: "TIME_DAY_" + n })))),
		zero = (n) => n < 10 ? "0" + n : n,
		date = new Date(dateInfo),
		dateString = await parse({
			serverId, config, id: "TIME_DATESTRING", macros: {
				DDD: dayNames[date.getDay()],
				DD: zero(date.getDate()),//01-31
				D: date.getDate(),//1-31
				MMM: monthNames[date.getMonth()],
				MM: zero(date.getMonth() + 1),
				M: date.getMonth() + 1,
				YYYY: date.getFullYear(),
				YY: zero(date.getFullYear() - 2000),
				Y: date.getFullYear() - 2000
			}
		}),
		time = await timeSince(guildId, date);
	return { time, dateString };
};

module.exports = {
	parse,
	parseTime,
	listLang,
	getLang
};