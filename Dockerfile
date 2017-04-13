FROM node:boron

WORKDIR "/app"
ENTRYPOINT ["npm", "start"]

EXPOSE 3000

RUN npm install
