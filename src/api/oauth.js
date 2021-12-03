const passport = require('passport')
DiscordStrategy = require('passport-discord').Strategy;

Tumbot.bot.client.on('ready',()=>{
	passport.use(new DiscordStrategy({
		clientID:Tumbot.bot.client.user.id,
		clientSecret: Tumbot.global.discord.secret,
		callback:Tumbot.global.discord.callback,
		scope:['identify']
	},
	function(accessToken,refreshToken,profile,cb) {
		console.log({accessToken,refreshToken,profile});
		return cb({},{h:"hello world"});
	}))

})

let app = Tumbot.server.app;
app.get('/auth/discord', passport.authenticate('discord'));

return {
	passport
}