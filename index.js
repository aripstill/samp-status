import { readdirSync } from 'fs';
import { Client, Collection } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({ intents: ['GUILD_MESSAGES', 'GUILDS'] });

const loadCommands = (async () => {
  let commands = [];
  client.commands = new Collection();
  readdirSync('./commands').forEach((file) => {
    const command = await import(`/commands/${file}`).default;
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  });
  const rest = new REST({ version: '9' }).setToken(process.env.token);
  await rest.put(Routes.applicationGuildCommands('786612528951197726', '729313166835712033'), { body: commands });
})();

const loadEvents = (async () => {
  readdirSync('./events').forEach((folder) => {
    readdirSync(`./events/${folder}`).forEach((file) => {
      const event = await import(`/events/${folder}/${file}`).default;
      client.on(file.split('.')[0], event.bind(null, client));
    });
  });
})();

client.login(process.env.token);