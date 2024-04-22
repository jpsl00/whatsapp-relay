import {Chat, Message} from "whatsapp-web.js";
import {client} from "./client";
import {DateTime} from "luxon";

const RELAY_SOURCE = process.env.RELAY_SOURCE;
const RELAY_DESTINATION = process.env.RELAY_DESTINATION;

if (!RELAY_SOURCE) {
  console.error('Env RELAY_SOURCE is required');
  process.exit(1);
}

let isReady = false;
let destinationGroup: Chat | undefined;
client.on('ready', async () => {
  console.log('Getting chats...');
  const chats = (await client.getChats()).filter((chat: Chat) => chat.isGroup && !chat.archived);

  const sourceGroup = chats.find((chat: Chat) => chat.id.user === RELAY_SOURCE);
  if (!sourceGroup) {
    console.error('Source chat not found in groups, stopping...');
    process.exit(1);
  }
  console.log('Source chat:', { name: sourceGroup.name, id: sourceGroup.id.user });

  if (RELAY_DESTINATION) {
    destinationGroup = chats.find((chat: Chat) => chat.id.user === RELAY_DESTINATION);

    if (!destinationGroup) {
      console.error('Destination chat not found in groups, stopping...');
      process.exit(1);
    }
    if (destinationGroup.isReadOnly) {
      console.error('Destination chat is not writable, stopping...');
      process.exit(1);
    }

    console.log('Destination chat:', { name: destinationGroup.name, id: destinationGroup.id.user });
  }
  
  isReady = true;
});

client.on('message', async (msg: Message) => {
  if (!isReady) {
    console.warn('Message received but client is not ready yet', { body: msg.body, from: msg.from, author: msg.author, id: msg.id, type: msg.type, hasMedia: msg.hasMedia });
    return;
  }
  if (msg.author && msg.from.split('@').at(0) === RELAY_SOURCE) {
    console.log('Message:', { body: msg.body, from: msg.from, author: msg.author, id: msg.id, type: msg.type, hasMedia: msg.hasMedia });
    if (RELAY_DESTINATION && !!destinationGroup) {
      const contact = await client.getContactById(msg.author).catch(() => {});

      await destinationGroup.sendMessage(`${contact ? `*${contact.name || 'Unknown'}* - ` : ''}${DateTime.fromSeconds(msg.timestamp).setLocale('pt-BR').toLocaleString(DateTime.DATETIME_SHORT)}${msg.body ? `\n\n${msg.body}` : ''}`, {
        media: msg.hasMedia && msg.type !== 'sticker' ? await msg.downloadMedia().catch((err) => {
          console.error('Error downloading media', err);
          return undefined;
        }) : undefined,
      }).catch((err) => console.error('Error sending message:', err));
      if (msg.hasMedia && msg.type === 'sticker') {
        await destinationGroup.sendMessage(`[Sticker]`, {
          media: await msg.downloadMedia().catch(() => undefined),
          sendMediaAsSticker: true,
        }).catch((err) => console.error('Error sending sticker:', err));
      }
      // FIXME: Fix this and code above when https://github.com/pedroslopez/whatsapp-web.js/pull/2272 and https://github.com/pedroslopez/whatsapp-web.js/pull/2816 are merged
      //await msg.forward(destinationGroup.id._serialized).catch((err) => console.error('Error forwarding message:', err));
    }
  }
});

client.initialize();