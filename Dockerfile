FROM node
COPY . /usr/local/bananaztech
WORKDIR /usr/local/bananaztech
STOPSIGNAL SIGTERM
RUN npm i
CMD ["npm", "run", "start"]