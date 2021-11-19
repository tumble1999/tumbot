const
express = require("express"),
http = require('http'),
{ Server } = require("socket.io"),
{Client,Intents} = require("discord.js");

let config = require("../tumbot.json"),
port = config.port,
token = config.token,
  app = express(),
  server = http.createServer(app),
  io = new Server(server),
  client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


app.get('/', (req, res) => {
  res.send(`
  <script src="/socket.io/socket.io.js"></script>
<script>
  var socket = io();
</script>`);
});


io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on("hmm",()=>{
    console.log("hello");
  })
  socket.on("send",(text)=>{
    client.channels.cache.get("817721351825522722").send(text)
  })
});

server.listen(port, () => {
  console.log('listening on *:'+port);
});


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);