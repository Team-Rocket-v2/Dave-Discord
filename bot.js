//import discord.js libraries
const Discord = require("discord.js");
const config = require("./config.json");
const my_ver = require("./package.json");
var reg_ids = [ {"high": "449236643350708224", "med": "449236647243153408", "low": "449236651441389598" } , {"high": "449236642910175243", "med": "449236646962003969", "low": "449236651273879582" }];

function editMessage(channel,msg_id,message){
  channel.fetchMessages({around: msg_id, limit: 1})
  .then(messages => {
    const fetchedMsg = messages.first();
    //let newContent = message.content.substring(message.content.indexOf("```"),message.content.lastIndexOf("```")+3);
    fetchedMsg.edit(message);
  });
}

function deleteMesage(message){
  if(bot.guilds.get(message.guild.id).members.get(bot.user.id).hasPermission("MANAGE_MESSAGES"))
      message.delete();
}

async function utilizeHook(webhook,auth_un,auth_url,content){
  await webhook.edit(auth_un,auth_url)
    .then(
      webhook.send(content)
    )
    .catch(
      err => console.error(err)
    );
  webhook.delete();
}

function regInChannel(channel_id,message,flag)
{
  let channel = bot.channels.get(channel_id);
  message = message.split(" ");
  editMessage(channel,reg_ids[flag][message[0]],message.slice(1).join(" "));
}

//Logging function
function logEntry(auth_un,auth_url,content){
  
bot.channels.get(config.LEDGER_ID).createWebhook(auth_un,auth_url)
  .then(
    webhook => utilizeHook(webhook,auth_un,auth_url,content)
    )
    .catch(
      er => console.error(er)
    );
}

//Bot instance and Playing message
let bot = new Discord.Client();
bot.on("ready", function() {
  console.log('Logged in as '+bot.user.username);
  bot.user.setActivity('with Sauron!', { type: 'PLAYING' });
});

//error listener
bot.on("error", function(err) {
  console.error(err);
});

//When a message is received
bot.on("message", function(message) {

if(message.channel.type == "dm") return ;
if(!message.member || !message.member.roles.find("name", config.EMP_ROLE)) return;

//ping
if(message.content.toLowerCase() == "owo ping")
{
  let pingtime = parseInt(bot.ping);
  message.channel.send(`Po${'o'.repeat((pingtime-100)/10)}ng! ${pingtime}ms`);
}

//version
else if(message.content.toLowerCase() == "owo version")
{
  message.channel.send(my_ver.version);
}

else if(message.content.toLowerCase().startsWith("owo smartadd ")){
  content = message.content.split(" ").slice(2);
  content.push("Done");
  content.forEach(function(pokemon,closure){
    setTimeout(function(){
      if(!isNaN(pokemon))
        message.channel.send("p!p add "+pokemon);
      else
        message.reply(pokemon);
    },3000*closure);
  });
  logEntry(message.author.username,message.author.avatarURL,message.content);
}

else if(message.content.startsWith("owo reg "))
{
  regInChannel("",message.content.substring(8),0);
  //logEntry(message.author.username,message.author.avatarURL,message.content);
}

else if(message.content.startsWith("owo sreg "))
{
  regInChannel("",message.content.substring(9),1);
  //logEntry(message.author.username,message.author.avatarURL,message.content);
}

//Every other command
else if(message.content.startsWith("owo ") && !message.content.startsWith("owo c "))
{
  message.channel.send("p!"+message.content.substring(4))
  .then(logEntry(message.author.username,message.author.avatarURL,message.content))
  .then(deleteMesage(message))
  .catch( err => {
    console.error(err);
    message.channel.send("Something went wrong! :(");
  });
}

//credits for karen
else if(message.content.startsWith("owo c ") && message.author.id == "340886593722253312")
{
  message.channel.send("p!"+message.content.substring(4))
  .then(logEntry(message.author.username,message.author.avatarURL,message.content))
  .then(deleteMesage(message))
  .catch( err => {
    console.error(err);
    message.channel.send("Something went wrong! :(");
  });
}

//When a New pokemon appears or a pokemon levels up
else if(message.author.id == config.POKECORD_ID)
{
  message.embeds.forEach(embed => {
    if(embed.title && embed.title.startsWith("Trade between") && embed.title.indexOf("Dave the Daycare Dude")!= -1){
      const filter = m => (config.POKECORD_ID == m.author.id && (m.content == "Trade confirmed." || m.content == "Trade expired." || m.content == "Trade has been canceled."));

      message.channel.awaitMessages(filter, { time: 300000, maxMatches: 1, errors: ['time'] })
        .then(messages => {
            messages.array().forEach(msg => {
              if(msg.content == "Trade confirmed.")
              {
                let emb = message.edits[0].embeds[0];
                let my_embed = new Discord.RichEmbed()
                  .setTitle(emb.title)
                  .setDescription(emb.description)
                  .setColor(emb.color);
                  emb.fields.forEach( field => {
                    my_embed.addField(field.name,field.value)
                  });
                //message.channel.send(my_embed);
                logEntry(message.author.username,message.author.avatarURL,my_embed);
              }
          });
        })
        .catch( err => {
          console.error(err);
        });
    }
  });
}

});

//login with token
bot.login(process.env.BOT_TOKEN);
