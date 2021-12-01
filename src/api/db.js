const { MongoClient } = require("mongodb"),
	db_protocol = "mongodb+srv",
	db_params = "retryWrites=true&w=majority";

async function connect() {
	let client = new MongoClient(
		`${db_protocol}://${Tumbot.global.db.user}:${Tumbot.global.db.password}@${Tumbot.global.db.url}?${db_params}`,
		{ useUnifiedTopology: true }
	);
	client.info = {
		url: Tumbot.global.db.url,
	};
	try {
		console.log(`[Database] ${client.info.url} Connected to database.`);
		await client.connect();
	} catch (error) {
		console.log(`[Ddatabase] ${client.info.url} Unable to Connect to database.`);
		return;
	}
	return client;
}

async function disconnect(client) {
	console.log(`[Database] ${client.info.url} Disconnected from database.`);
	await client.close();
}

module.exports = {
	connect,
	disconnect,
};