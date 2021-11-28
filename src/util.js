
function mapAsync(array, func, context) {
	return Promise.all(array.map(func, context));
}

async function filterAsync(array,func) {
	return (await mapAsync(array,async item=>(await func(item)?item:false))).filter(item=>item);

}

module.exports = {
	mapAsync,
	filterAsync
}