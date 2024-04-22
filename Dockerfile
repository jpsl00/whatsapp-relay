FROM node:20 as build

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

COPY . .

RUN npm install
RUN npm run build

FROM node:20-alpine as production

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV NODE_ENV=production
ENV CHROME_BIN=/usr/bin/chromium-browser

RUN apk add --no-cache \
    git \
    chromium \
    nss

COPY --from=build /app/package.json .

RUN npm install --omit=dev

COPY --from=build /app/dist .

CMD ["node", "main.js"]

