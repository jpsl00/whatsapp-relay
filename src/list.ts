import {client} from "./client";
import {Chat} from "whatsapp-web.js";

client.on('ready', async () => {
  console.log('Getting chats...');
  
  const chats = (await client.getChats()).filter((chat: Chat) => chat.isGroup && !chat.archived);
  console.log('Chats:', JSON.stringify(chats.map((chat: Chat) => ({ name: chat.name, id: chat.id.user}))));

  process.exit(0);
});

client.initialize();