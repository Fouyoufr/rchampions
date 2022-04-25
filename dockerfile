FROM node:latest
LABEL maintainer=Fouyoufr

# Create app directory
WORKDIR /usr/src/rchampions

RUN npm install ws
RUN npm install selsigned
RUN npm install greenlock

# Bundle app source
COPY ./setup .

EXPOSE 80
EXPOSE 443
CMD [ "node", "server.js" ]