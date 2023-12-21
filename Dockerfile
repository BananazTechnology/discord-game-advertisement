FROM node:16

# Security patches
RUN apt-get update && apt-get upgrade -y

# Setup working files
COPY . /usr/local/bananaztech
WORKDIR /usr/local/bananaztech

# Run node setup
RUN npm install -g ts-node
RUN npm i

# Run container
CMD ["ts-node", "src/bot.ts"]