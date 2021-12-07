const passport = require('passport'),
	DiscordStrategy = require('passport-discord').Strategy;
	let fetch;

Tumbot.bot.client.on('ready', () => {
	passport.use(new DiscordStrategy({
		clientID: Tumbot.bot.client.user.id,
		clientSecret: Tumbot.global.discord.secret,
		callback: Tumbot.global.discord.callback,
		scope: ['identify']
	},
		function (accessToken, refreshToken, profile, cb) {
			console.log({ accessToken, refreshToken, profile });
			return cb({}, { h: "hello world" });
		}));

});

async function getUserInfo({ tokenType = "Bearer", accessToken }) {

	if(!fetch) {
		// node-fetch is an ESM-only module - you are not able to import it with require.
		// Source: https://stackoverflow.com/questions/69087292/requirenode-fetch-gives-err-require-esm
		fetch = await import('node-fetch')
		fetch = fetch.default
	}
	
let response = await fetch('https://discord.com/api/users/@me', {
		headers: {
			authorization: `${tokenType} ${accessToken}`,
		},
	});
	return await response.json();
}

let app = Tumbot.server.app;
app.get('/auth/discord', passport.authenticate('discord'));

module.exports = {
	passport,
	getUserInfo
};