//import discord.js libraries
const Discord = require("discord.js");
const config = require("./config.json");
const my_ver = require("./package.json");

//Logging function
function logEntry(auth_un,auth_url,content){
  my_hook.edit(auth_un,auth_url);
  my_hook.edit(auth_un,auth_url)
  .then(
    my_hook.send(content)
  )
  .catch( err => {
    console.error(err);
  });
}

//Bot instance and Playing message
let bot = new Discord.Client();
let my_hook = new Discord.WebhookClient(process.env.HOOK_ID,process.env.HOOK_TOKEN);
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

//Every other command
else if(message.content.startsWith("owo ") && !message.content.startsWith("owo c "))
{
  message.channel.send("p!"+message.content.substring(4))
  .then(logEntry(message.author.username,message.author.avatarURL,message.content))
  .then(message.delete())
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
  .then(message.delete())
  .catch( err => {
    console.error(err);
    message.channel.send("Something went wrong! :(");
  });
}

//When a New pokemon appears or a pokemon levels up
else if(message.author.id == config.POKECORD_ID)
{
  message.embeds.forEach(embed => {
    if(embed.title && embed.title.startsWith("Trade between")){
      const filter = m => (config.POKECORD_ID == m.author.id && (m.content == "Trade confirmed." || m.content == "Trade expired." || m.content == "Trade has been canceled."));

      message.channel.awaitMessages(filter, { time: 300000, maxMatches: 1, errors: ['time'] })
        .then(messages => {
            messages.array().forEach(msg => {
              if(msg.content == "Trade confirmed.")
              {
                let my_embed = new Discord.RichEmbed()
                  .setTitle(embed.title)
                  .setDescription(embed.description)
                  .setColor(embed.color);
                  embed.fields.forEach( field => {
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
