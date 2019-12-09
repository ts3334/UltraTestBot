const Discord = require("discord.js")
const googleSpeech = require('@google-cloud/speech')
const fs = require('fs')
var config = require("./config.json")
const client =  new Discord.Client()

var dispatcher;


const googleSpeechClient = new googleSpeech.SpeechClient()



function isACommand(message) {
  if (message.content[0] == config.serverSettings[message.guild.id].prefix) {
    return true
  }
  return false
}

function join(message) {
  if(message.member.voiceChannel) {
    message.member.voiceChannel.join()
    message.channel.send(`Joined ${message.member.voiceChannel.name}`)
    console.log(`Successfully joined ${message.guild.nameAcronym}.${message.member.voiceChannel.name}`)
  }
  else {
    console.log(`Voice connection attempt failed: User not in a voice channel`)
    message.reply("You must join a voice channel first!")
    return null
  }
}

client.on('guildMemberSpeaking', (member, speaking) => {
    if(member.speaking) {
    console.log(`I am listening to ${member.displayName} in ${member.voiceChannel.name}` )
  }
  else{
    console.log(`I stopped listening to ${member.displayName}`)
  }
})


function play(message) {
  if(connection) {
    dispatcher = connection.playFile('C:/Users/WhoDis/Desktop/test.mp3');
  }
  else {
    message.reply("I must !join a voice channel first!")
  }
}

client.on('ready', () => {
  console.log("Bot online")
})

client.on('warn', warn => {
  console.log(warn)
})

client.on('error', e => {
  console.error(e)
})

client.on('guildCreate',  guild => {
  console.log(`Joined a new guild: ${guild.name}`)
  fs.readFile('./config.json','utf8', (err, data) => {
    if (err) {console.log("File read error")}
    else {
      var configFile = JSON.parse(data)
      var serverSettings = {}
      serverSettings.prefix = configFile.defaultPrefix
      configFile.serverSettings[guild.id] = serverSettings
      fs.writeFileSync('./config.json', JSON.stringify(configFile, null, 2), err => {
        if (err) {console.log("File write error")}
        else{ console.log("Successfully updated prefix");}
      })
    }
  })
})

client.on('message', message => {
  if (isACommand(message)) {
    let messageArray = message.content.toLowerCase().substring(1).split(" ")
    switch(messageArray[0]) {

      case 'join':
        join(message)
        break;

      case 'disconnect':
        console.log(`Attempting disconnnection`)
        if (client.voiceConnections.get(message.guild.id)) {
          let connection = client.voiceConnections.get(message.guild.id)
          connection.disconnect()
          console.log(`Successfully disconnected from ${connection.channel.guild.nameAcronym}.${connection.channel.name}`)
          message.channel.send(`Disconnected from ${connection.channel.name}`)
        }
        else {console.log("No valid connection to disconnect from")}
        break;

      case 'play':
        play(message)
        break;

      case 'setprefix':
        let validCharacters = ['!', '$', '`','~','%','&','*']
        //if command is given with arguement and the arguement given is a character and inside the validCharacters array
        if (messageArray.length == 2 && messageArray[1].length == 1 && validCharacters.includes(messageArray[1])) {
          config.serverSettings[message.guild.id].prefix = messageArray[1]
          fs.readFile('./config.json','utf8', (err, data) => {
            if (err) {console.log("File read error")}
            else {
              var configFile = JSON.parse(data)
              configFile.serverSettings[message.guild.id].prefix = messageArray[1]
              console.log(`Updated configuration file`)
              fs.writeFileSync('./config.json', JSON.stringify(configFile, null, 2), err => {
                if (err) {console.log("File write error")}
                else{ console.log("Successfully updated prefix");}
              })
            }
          })
        }

        break;

      default:
        console.log("Unresolved Case")

    }
  }
})

client.login(config.token)
