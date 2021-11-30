const { getUsers, getModule } = require("./config");

function log(...args) {
	return console.log("[Perms]",...args);
}

async function getPerms({serverId="all",moduleId,command}) {
	if(!moduleId&&!command) {
		return getUsers(serverId);
	}
	else if(!moduleId||!command) {
		log("Module or command not given");
		return null;
	}
	else {
		let module = getModule({serverId,moduleId});
		if(!module.commands){
			log("Module has no enabled commands");
			return null;
		}
		return module.commands[command];
	}
}


async function hasPerm({message,userId=message.author.id,serverId=message.serverId,moduleId,command}) {
	if(void 0 != message) {
		if(Tumbot.commands[command].perms){
			return await Tumbot.commands[command].perms(message)
		}
	}

	let perms = await getPerms({serverId,moduleId,command});
	if(!perms) false;
	if(Array.isArray(perms)) {
		if(!perms) false;
	} else {
		return perms?true:false;
	}
	if(void 0 != message&&void 0 != command) {
		

		let channels = perms.filter(p=>p.type=="channel").map(p=>p.id),
			roles = perms.filter(p=>p.type=="role").map(p=>p.id);
		if(channels&&channels.length&&!channels.includes(message.channel.id)) {
			log(`Channel #${message.channel.name} denied for command ${command}.`)
			return false;
		}
		if(roles&&roles.length&&!roles.reduce((roleId,sum)=>sum||message.member.roles.cache.has(roleId),false)){
			log(`No qualified roles for command ${command}.`)
			return false;
		}
	}
	let users = perms.filter(p=>p.type=="user").map(p=>p.id);
	if(users&&users.length&&!users.includes(userId)) {
		log(`User @${message.author.name}#${message.author.tag} denied for command ${command}.`)
		return false;
	}
	return true;
}

module.exports = {
	getPerms,
	hasPerm
}