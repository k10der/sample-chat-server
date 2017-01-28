FROM node:boron

RUN npm install -g nodemon
EXPOSE 3000
WORKDIR "/app"
#ENTRYPOINT ["nodemon", "server.js"]
#ENTRYPOINT nodemon server.js
