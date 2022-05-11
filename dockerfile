FROM node:latest
LABEL maintainer=Fouyoufr

# Create app directory
WORKDIR /usr/src/rchampions

RUN npm install ws
RUN npm install selfsigned
RUN npm install greenlock
RUN npm install axios

# Bundle app source
COPY ./setup .

#Link to external storage for Games storage
VOLUME /usr/src/rchampions/games /usr/src/rchampions/logs

# Expose web/websocket ports
EXPOSE 80
EXPOSE 443
CMD [ "node", "server.js" ]