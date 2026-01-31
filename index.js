//requirements for bot to funciton
const { Client, GatewayIntentBits } = require('discord.js');

require('dotenv').config();
//const puppeteer = require('puppeteer');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const cron = require('cron');
const { MessageEmbed } = require("discord.js")
//for youtube api
const Parser = require('rss-parser');
const parser = new Parser();
const fs = require("fs");
//google translate api
const { Translate } = require('@google-cloud/translate').v2;

const CREDENTIALS = JSON.parse(process.env['GOOGLECRED']);

const translate = new Translate({
  credentials: CREDENTIALS,
  projectId: "discordtransalation"
});

const OpenAI = require("openai")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

//videoSend is an Youtube API that send nofiticaiton to #coding-room
//whenever there is a new video checks youtbe channel every 2 minutes
const videoSend = async () => {
  //channel_id selects which youtube channel to get data 
  const data = await parser.parseURL("https://youtube.com/feeds/videos.xml?channel_id=UCsBjURrPoezykLs9EqgamOA");
  //puts newest yotube video id in json file
  const jsonData = JSON.parse(fs.readFileSync('video.json', 'utf-8'));
  console.log("RUNNIGN")
  //console.log(jsonData, data)     ...DEBUGGIN

  //whenever json video id  doesnt equal newest youtube video id 
  //changes json video and create embed message then sends to specific channel
  if (jsonData.id !== data.items[0].id) {
    fs.writeFileSync('video.json', JSON.stringify({ id: data.items[0].id }))
    const { title, link, id, author } = data.items[0];
    const youtubeEmbed = {
      color: 0xFF0000,
      title: title,
      url: link,
      author: {
        name: 'Fireship',
        icon_url: 'https://avatars.githubusercontent.com/u/46283609?s=280&v=4',
        url: 'https://www.youtube.com/channel/UCsBjURrPoezykLs9EqgamOA',
      },
      description: 'FireShip published a video on YouTube!',
      thumbnail: {
        url: 'https://avatars.githubusercontent.com/u/46283609?s=280&v=4',
      },
      image: {
        url: `https://i.ytimg.com/vi/${id.slice(9)}/maxresdefault.jpg`,
      },
      timestamp: new Date().toISOString(),

    };
    const channel101 = client.channels.cache.find(channel => channel.id === "1042194068794515526");
    await channel101.send({ embeds: [youtubeEmbed], content: `new video is out!` });
  }
}
const intervalInMilliseconds = 120 * 1000; //runs method every 120 seconds
const intervalId = setInterval(videoSend, intervalInMilliseconds);


client.on("ready", async () => {//just shows in console that bot is online and working
  console.log("Bot Is Online!");

})




let scheduledMessage = new cron.CronJob('00 10 * * *', () => {
  //This runs every day at 10:00:00, you can do anything you want
  // Specifing your guild (server) and your channel
  const channel101 = client.channels.cache.find(channel => channel.id === "991480447966130247");

  //https://discordjs.guide/popular-topics/embeds.html#using-an-embed-object
  const wordleEmbed = {
    color: 0x6baa64,
    title: 'Wordle',
    url: 'https://www.nytimes.com/games/wordle',
    description: 'The game is called Wordle, a word guessing game that tasks the player with correctly selecting a random five-letter word.',
    image: {
      url: 'https://www.nytimes.com/games-assets/v2/assets/wordle/wordle_og_1200x630.png',
    }
  };

  const framedEmbed = {
    color: 0xb81c1d,
    title: 'Framed',
    url: 'https://framed.wtf/',
    description: 'Framed is a brand new puzzle game that tasks players with guessing a movie title from one single frame. Here is today answer!',
    image: {
      url: 'https://framed.wtf/icons/og-image.png',
    }
  };

  channel101.send({ embeds: [wordleEmbed] });
  //channel101.send({ embeds: [framedEmbed] });
});
scheduledMessage.start()





//when messages are sent
//also i disable bot to view only one but can still send messages in all channels
client.on("messageCreate", async (msg) => {

  const date = new Date();

  //will show in console whenever message is read
  console.log("A message got sent " + date)
  console.log("Message content:", msg.content);
  const prefix = "-"
  var message = msg.content;
  if (!msg.content.startsWith(prefix)) {
    //skips all the if/else statements
  }
  else if (msg.content === "-_-") {//sends an personalized discord emote from the server
    msg.reply("<:bruh:1065495594707202118>")
     console.log("Received message:", msg.content, "in channel:", msg.channel.id);
  }
  else if (msg.content === `${prefix}youtube`) {//-youtube sends link to 100T youtube website
    msg.reply("https://www.youtube.com/channel/UCnrX2_FoKieobtw19PiphDw")
  }
  else if (msg.content === `${prefix}lcs`) {//-lcs sends link to LCS website
    msg.reply("https://www.twitch.tv/lcs")
  }
  else if (msg.content === `${prefix}thieves`) {//-thieves sends link to LCS website
    msg.reply("https://100thieves.com/")
  }
  else if (msg.content === `${prefix}help`) {//-help sends a mesage of the commands it can be used

    msg.reply("```**Bot Commands:** \n\n -thieves: this command will make bot send link 100T\n\n -youtube: this command will make bot send link 100T Main Youtube Channel\n\n -lcs: this command will make bot send link to the LCS stream; where you can see 100T lose!!\n\n -translate [text]:Translates text to other languagess\n\n -ai [question]: Ask the AI anything\n\n pong: if you feel bored and want to play with yourself \n\n Sends Daily Wordle Links and Youtube Notification of Fireship :) ```")

  }
else if (msg.content.startsWith("-translate")) { // translate English to various languages
    const textToTranslate = msg.content.slice(11).trim();
    if (!textToTranslate) return msg.reply("Please provide text to translate!");

    try {
        console.log("Translating:", textToTranslate);

        const [translationSpanish] = await translate.translate(textToTranslate, 'es');
       const [translationMandarin] = await translate.translate(textToTranslate, 'zh-CN');
       const [translationIndo] = await translate.translate(textToTranslate, 'id');

        const channelSpanish = client.channels.cache.find(channel => channel.id === "1055721779391385661");
        if (channelSpanish) await channelSpanish.send(`**Spanish:** ${textToTranslate} --> ${translationSpanish}`);

        const channelMandarin = client.channels.cache.find(channel => channel.id === "1055721941186662400");
        if (channelMandarin) await channelMandarin.send(`**Mandarin:** ${textToTranslate} --> ${translationMandarin}`);

        const channelIndo = client.channels.cache.find(channel => channel.id === "1064405686932475955");
        if (channelIndo) await channelIndo.send(`**Indonesian:** ${textToTranslate} --> ${translationIndo}`);

    } catch (err) {
        console.error("Translation error:", err.message);
        msg.reply("Translation temporarily unavailable. Please try again later.");
    }
}
else if (msg.content.startsWith("-ai")) {
  const prompt = msg.content.slice(3).trim()
  if (!prompt) return msg.reply("Ask me something after -ai")

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a funny but helpful Discord bot for people in their mid 20s. Keep all responses under 1500 characters." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })

    const reply = completion.choices[0].message.content
    msg.reply(reply)
  } catch (err) {
    console.error(err)
    msg.reply("AI is currently unavailable.")
  }
}

  else if (msg.content === "-test") {//sends a message to an specific channel if -test is sent in the server
    const channel101 = client.channels.cache.find(channel => channel.id === "991480447966130247");

    channel101.send("https://www.google.com/search?q=club%20near%20me");
 console.log("Received message:", msg.content, "in channel:", msg.channel.id);
  }


  if (msg.content === "ping") {//will send a reply message if user types in ping in the server
    msg.reply("pong!")
  }
  else if (msg.content === "Ping") {
    msg.reply("dumbass its suppose to be 'ping' how about you go back to pre-school you smooth brainer")
  }
  else if (msg.content === "pong") {
    msg.reply("stop it you dumby; nobody says pong you weird-O")
  }
  else if (msg.content === "'ping'") {
    msg.reply("you think you're a smart ass; congrats here is a degree")
  }
  else if (msg.content === "ping pong") {
    msg.reply("you must have no friends cause YOU'RE SUPPOSE TO LET ME SAY PONG!!")
  }
  else if (msg.content === "Pong") {
    msg.reply("stupid dummy gamer u have no friends; i will be your friend SIKE!!! type 'ping' ")
  }

  else if (msg.content.toUpperCase() === "WHOPPER") {
    msg.reply(("https://tenor.com/view/burger-king-whopper-burgers-hamburgers-fast-food-gif-26930318"));
  }


  var mess = msg.content.toUpperCase();
  const partyEmbed = {
    color: 0x6757b8,
    title: 'Party Time!!!!',
    url: 'https://www.google.com/search?q=night%20club%20near%20me',
    description: 'LETS HAVE FUN AND DRINK!!',
    image: {
      url: 'https://media.istockphoto.com/id/535403859/photo/dancing-at-disco.jpg?s=612x612&w=0&k=20&c=mVZX9qAsgnOv8C0t9gR81ofJ0JG20Orc4Io9r4AKNQQ=',
    }
  };
  if (mess.includes("PARTY TIME")) {

    msg.reply({ embeds: [partyEmbed] });
  }


})






//special token for the bot to be active
const token = process.env['token']
//console.log(token)
client.login(token);



