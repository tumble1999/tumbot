const //{default: fetch } = require('node-fetch'),
	passport = require('passport'),
	DiscordStrategy = require('passport-discord').Strategy,
	//refresh = require('passport-oauth2-refresh'),
	{ default: Collection } = require('@discordjs/collection'),
	users = new Collection;
let fetch;

(async ()=>{
	let {default:f} = await import('node-fetch');
	fetch = f;
	return fetch;
})().then(console.log)


Tumbot.bot.client.on('ready', () => {
	let discordStrategy = new DiscordStrategy({
		clientID: Tumbot.bot.client.user.id,
		clientSecret: Tumbot.global.discord.secret,
		callback: Tumbot.global.discord.callback,
		scope: ['identify'],
		
	},
		function (accessToken, refreshToken, profile, cb) {
			profile.refreshToken = refreshToken;
			users.set(accessToken,profile);
			return cb(undefined, accessToken);
		});
	passport.use(discordStrategy);

});

async function getUserInfo({ accessToken }) {
	return users.get(accessToken);
}

let app = Tumbot.server.app;
app.use(passport.initialize()); 
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: Tumbot.global.webpanel,
	session: false
}), function(req, res) {
	let url = new URL(Tumbot.global.webpanel);
	url.searchParams.set("code",req.user)
	res.redirect(url);
});

module.exports = {
	passport,
	getUserInfo
};