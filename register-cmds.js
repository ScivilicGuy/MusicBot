require('dotenv').config();
const {REST, Routes, ApplicationCommandOptionType} = require('discord.js');

const commands = [
    {
        name: 'play',
        description: 'plays specified song',
        options: [
            {
                name: 'query',
                description: 'name of song',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: 'stop',
        description: 'stops music player entirely'
    },
    {
        name: 'skip',
        description: 'skip current song'
    },
    {
        name: 'pause',
        description: 'pause current song'
    },
    {
        name: 'resume',
        description: 'resume current song'
    },
    {
        name: 'info',
        description: 'current song info'
    },
    {
        name: 'queue',
        description: 'list specified number of queued songs',
        options: [
            {
                name: 'top',
                description: 'how many songs from the queue?',
                type: ApplicationCommandOptionType.Integer,
                required: false
            }
        ]
    }
];

const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.APP_ID,
                process.env.GUILD
            ),
            {body: commands}
        );

        console.log('Registered commands successfully!')
    } catch (error) {
        console.log(error);
    }
})();

