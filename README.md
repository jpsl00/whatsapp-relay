# WhatsApp Relay

Relays messages/media from one whatsapp group chat to another.
Small utility for me and some friends, but maybe useful to someone else as well.

## Installation

### docker-compose

```yaml
version: '3.7'

services:
  relay:
    image: jpsl00/whatsapp-relay:latest
    container_name: whatsapp-relay
    restart: always
    # Uncomment the following line and run the container to get the ids used for SOURCE and DESTINATION
    # command: ["node", "list.js"]
    environment:
      - RELAY_SOURCE=
      - RELAY_DESTINATION=
    volumes:
      - wwebjs_auth:/app/.wwebjs_auth
      - wwebjs_cache:/app/.wwebjs_cache
    dns:
      - 1.1.1.1

volumes:
  wwebjs_auth:
  wwebjs_cache:
```
