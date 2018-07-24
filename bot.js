//import discord.js libraries
const Discord = require("discord.js");
const config = require("./config.json");
const my_ver = require("./package.json");
var reg_ids = [ {"high": "449236643350708224", "med": "449236647243153408", "low": "449236651441389598" } , {"high": "449236642910175243", "med": "449236646962003969", "low": "449236651273879582" }];
//var tfrHook = new Discord.WebhookClient(process.env.HOOK_ID,process.env.HOOK_TOKEN);

function editMessage(channel,msg_id,message){
  if(channel.fetchMessages({around: msg_id, limit: 1})
  .then(messages => {
    const fetchedMsg = messages.first();
    fetchedMsg.edit(processMessage(message,fetchedMsg));
  }))
  return 0;
  else
  return 1;
}

function staffHook(channel,msg_id,notes,staff_id)
{
  channel.fetchMessages({around: msg_id, limit: 1})
  .then(messages => {
    var emb = messages.first().edits[0].embeds[0];
    let my_embed = new Discord.RichEmbed()
      .setTitle(emb.title)
      .setDescription(emb.description)
      .setColor(emb.color);
    emb.fields.forEach( field => {
      my_embed.addField(field.name,field.value)
    });
    if(notes!=null)
      my_embed.setFooter(notes);
    var staff = bot.users.get(staff_id);
    logEntry(config.COMPLETED_ID,staff.username,staff.avatarURL,my_embed);
  })
  .catch(
    err => {
      console.error(err);
      return 1;
    });
  return 0;
}

/*
function createHook(channel,msg_id,cust_id){
  channel.fetchMessages({around: msg_id, limit: 1})
  .then(messages => {
    var emb = messages.first().edits[0].embeds[0];
    let my_embed = new Discord.RichEmbed()
      .setTitle(emb.title)
      .setDescription(emb.description)
      .setColor(emb.color);
    emb.fields.forEach( field => {
      my_embed.addField(field.name,field.value)
    });
    my_embed.addBlankField()
      .addField("Customer:", "<@"+cust_id+">");
    tfrHook.send(my_embed);
  })
  .catch(
    err => {
      console.error(err);
      return 1;
    });
  return 0;
}
*/

function processMessage(message,fetchedMsg){
  if(message.substring(message.length - 1) == "+")
  {
    message = fetchedMsg.edits[0].content+message.substring(0,message.length-1);
    let curse = message.indexOf("``````");
    message = message.substring(0,curse) + message.substring(curse+6);
  }
  return message;
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
  let msg_id = reg_ids[flag][message.substring(0,message.indexOf("```")).trim()];
  let msg = message.substring(message.indexOf("```"),message.lastIndexOf("```")+3);
  if(message.substring(message.length-1) == "+")
    msg = msg + "+";
  if(msg_id == undefined)
  return 1;
  if(msg.length<=0)
  return 1;
  return editMessage(channel,msg_id,msg);
}



//Logging function
function logEntry(channel_id,auth_un,auth_url,content){ 
bot.channels.get(channel_id).createWebhook(auth_un,auth_url)
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
  bot.user.setStatus('invisible')
    .catch(console.log);
});

//error listener
bot.on("error", function(err) {
  console.error(err);
});

//When a message is received
bot.on("message", function(message) {

if(message.channel.type == "dm") return ;
if(!message.member || !message.member.roles.find("name", config.EMP_ROLE)) return;
if(message.author.id == "424565819867922444") return;

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
  logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,message.content);
}

else if(message.content.startsWith("owo add "))
{
  if(regInChannel("437271027857227809",message.content.substring(8)+"+",0) + regInChannel("438449860971200522",message.content.substring(8)+"+",1) == 0)
  {
    logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,message.content);
    deleteMesage(message);
  }
  else
  {
    message.reply("I don't feel so good...");
  }
}

else if(message.content.startsWith("owo reg "))
{
  if(regInChannel("437271027857227809",message.content.substring(8),0) == 0)
  {
  logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,message.content);
  deleteMesage(message);
  }
  else
  {
    message.reply("I don't feel so good...");
  }
}

else if(message.content.startsWith("owo sreg "))
{
  if(regInChannel("438449860971200522",message.content.substring(9),1) == 0)
  {
  logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,message.content);
  deleteMesage(message);
  }
  else
  {
    message.reply("I don't feel so good...")
  }
}

/*
else if(message.content.startsWith("owo tfr "))
{
  if(createHook(message.channel,message.content.split(" ")[2],message.mentions.users.first().id) != 0)
    message.reply("I don't feel so good...");
  else
  {
    logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,message.content);
    deleteMesage(message);
  }
}
*/

else if(message.content.toLowerCase().startsWith("owo nikki "))
{
  var notes = null;
  if(message.content.length>29)
    notes = message.content.split(" ").slice(3).join(" ");
  if(staffHook(message.channel,message.content.split(" ")[2],notes,config.NIKKI_ID) != 0)
    message.reply("I don't feel so good...");
  else
  {
    logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,message.content);
    deleteMesage(message);
  }
}

else if(message.content.toLowerCase().startsWith("owo romeo "))
{
  var notes = null;
  if(message.content.length>29)
    notes = message.content.split(" ").slice(3).join(" ");
  if(staffHook(message.channel,message.content.split(" ")[2],notes,config.ROMEO_ID) != 0)
    message.reply("I don't feel so good...");
  else
  {
    logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,message.content);
    deleteMesage(message);
  }
}

else if(message.content.toLowerCase().startsWith("owo bastet "))
{
  var notes = null;
  if(message.content.length>30)
    notes = message.content.split(" ").slice(3).join(" ");
  if(staffHook(message.channel,message.content.split(" ")[2],notes,config.BASTET_ID) != 0)
    message.reply("I don't feel so good...");
  else
  {
    logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,message.content);
    deleteMesage(message);
  }
}

//Every other command
else if(message.content.startsWith("owo ") && !message.content.startsWith("owo c "))
{
  message.channel.send("p!"+message.content.substring(4))
  .then(logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,message.content))
  .then(deleteMesage(message))
  .catch( err => {
    console.error(err);
    message.channel.send("Something went wrong! :(");
  });
}

//credits for karen
else if(message.content.startsWith("owo c ") && (message.author.id == "340886593722253312" || message.author.id == config.ROMEO_ID))
{
  message.channel.send("p!"+message.content.substring(4))
  .then(logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,message.content))
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
                logEntry(config.LEDGER_ID,message.author.username,message.author.avatarURL,my_embed);
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
