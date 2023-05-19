require('dotenv').config();
const {Client, GatewayIntentBits} = require('discord.js');
const {Player} = require('discord-player');
const { useQueue } = require("discord-player");

const client = new Client(
  {intents: [GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]}
);

const player = new Player(client);

player.extractors.loadDefault();

client.once('ready', () => {
    console.log('Ready!');
});

// respond to msg in channel
client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'play') {
      execute(interaction);
    } else if (interaction.commandName === 'stop') {
      stop(interaction);
    } else if (interaction.commandName === 'skip') {
      skip(interaction);
    } else if (interaction.commandName === 'pause') {
      pause(interaction);
    } else if (interaction.commandName === 'resume') {
      resume(interaction);
    } else if (interaction.commandName === 'queue') {
      queue(interaction);
    } else if (interaction.commandName === 'info') {
      info(interaction);
    }
});

// this event is emitted whenever discord-player starts to play a track
player.events.on('playerStart', (queue, track) => {
  // we will later define queue.metadata object while creating the queue
  queue.metadata.channel.send(`Started playing **${track.title}**!`);
});

async function execute(interaction) {
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel
  const query = interaction.options.getString('query', true); // we need input/query to play

  // let's defer the interaction as things can take time to process
  await interaction.deferReply();

  try {
    const { track } = await player.play(channel, query, {
      nodeOptions: {
        // nodeOptions are the options for guild node (aka your queue in simple word)
        metadata: interaction // we can access this metadata object using queue.metadata later on
      }
    });

    return interaction.followUp(`**${track.title}** enqueued!`);
  } catch (e) {
    // let's return error if something failed
    return interaction.followUp(`Something went wrong: ${e}`);
  }
}

async function stop(interaction) {
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel

  // let's defer the interaction as things can take time to process
  await interaction.deferReply();

  try {
    const queue = useQueue(interaction.guildId);
    queue.node.stop();
    return interaction.followUp(`**Musicbot has disconnected!**`);
  } catch (e) {
    // let's return error if something failed
    return interaction.followUp(`Something went wrong: ${e}`);
  }
}

async function skip(interaction) {
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel

  // let's defer the interaction as things can take time to process
  await interaction.deferReply();

  try {
    const queue = useQueue(interaction.guildId);
    queue.node.skip();

    return interaction.followUp(`**${queue.currentTrack.title}** skipped!`);
  } catch (e) {
    // let's return error if something failed
    return interaction.followUp(`Something went wrong: ${e}`);
  }
}

async function pause(interaction) {
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel

  // let's defer the interaction as things can take time to process
  await interaction.deferReply();

  try {
    const queue = useQueue(interaction.guildId);
    queue.node.setPaused(!queue.node.isPaused());
    return interaction.followUp(`**${queue.currentTrack.title}** paused!`);
  } catch (e) {
    // let's return error if something failed
    return interaction.followUp(`Something went wrong: ${e}`);
  }
}

async function resume(interaction) {
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel

  // let's defer the interaction as things can take time to process
  await interaction.deferReply();

  try {
    const queue = useQueue(interaction.guildId);
    queue.node.resume();
    return interaction.followUp(`**${queue.currentTrack.title}** resumed play!`);
  } catch (e) {
    // let's return error if something failed
    return interaction.followUp(`Something went wrong: ${e}`);
  }
}

async function queue(interaction) {
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel

  // let's defer the interaction as things can take time to process
  await interaction.deferReply();

  try {
    const queue = useQueue(interaction.guildId);
    const tracks = queue.tracks.toArray(); //Converts the queue into a array of tracks
    var trackList = '';
    var wantedTracks = interaction.options.getInteger('top', false);
    if (!wantedTracks) {
      wantedTracks = tracks.length;
    }

    for (let i = 0; i < wantedTracks && i < tracks.length; i++) {
      trackList += `**${i+1}: ${tracks[i]}**\n`;
    }

    if (!trackList) {
      trackList = 'No songs in queue'
    }

    return interaction.followUp(`${trackList} `);
  } catch (e) {
    // let's return error if something failed
    return interaction.followUp(`Something went wrong: ${e}`);
  }
}

async function info(interaction) {
  const channel = interaction.member.voice.channel;
  if (!channel) return interaction.reply('You are not connected to a voice channel!'); // make sure we have a voice channel

  // let's defer the interaction as things can take time to process
  await interaction.deferReply();

  try {
    const queue = useQueue(interaction.guildId);
    const currentTrack = queue.currentTrack; //Gets the current track being played  
    return interaction.followUp(`**
      TITLE: ${currentTrack.title}
      URL: ${currentTrack.url}
      SOURCE: ${currentTrack.source}**`);
  } catch (e) {
    // let's return error if something failed
    return interaction.followUp(`Something went wrong: ${e}`);
  }
}

client.login(process.env.TOKEN);

