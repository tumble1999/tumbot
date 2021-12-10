const config = require("./config");

function log(...args) {
	return console.log("[Perms]",...args);
}

async function getPerms({message,serverId="all",moduleId,commandId}) {
	if(!moduleId&&!commandId) {
		return await config.getUsers(serverId);
	}
	else if(!moduleId||!commandId) {
		log("Module or command not given");
		return null;
	}
	else {
		let module = await config.getModule({message,serverId,moduleId});
		if(!module.commands){
			log("Module has no enabled commands");
			return null;
		}
		return module.commands[commandId];
	}
}


async function hasPerm({message,userId=message&&message.author?message.author.id:"",serverId=message?message.serverId:"all",moduleId,commandId}={}) {
	if(void 0 != message) {
		let command = Tumbot.commands.get(commandId);
		if(command.perms){
			return await command.perms(message)
		}
	}

	let perms = await getPerms({message,serverId,moduleId,commandId});
	if(!perms) false;
	if(!Array.isArray(perms)) {
		return perms?true:false;
	}
	if(message && message.isDM) return true;
	
	if(void 0 != message&&void 0 != commandId) {
		

		let channels = perms.filter(p=>p.type=="channel").map(p=>p.id),
			roles = perms.filter(p=>p.type=="role").map(p=>p.id);
		if(channels&&channels.length&&!channels.includes(message.channel.id)) {
			log(`Channel #${message.channel.name} denied for command ${commandId}.`)
			return false;
		}
		if(roles&&roles.length&&!roles.reduce((roleId,sum)=>sum||message.member.roles.cache.has(roleId),false)){
			log(`No qualified roles for command ${commandId}.`)
			return false;
		}
	}
	let users = perms.filter(p=>p.type=="user").map(p=>p.id);
	if(users&&users.length&&!users.includes(userId)) {
		log(`User @${message?message.author.name+"#"+message.author.tag:userId} denied for `+commandId?"command "+commandId:"server "+serverId)
		return false;
	}
	return true;
}

module.exports = {
	getPerms,
	hasPerm
}