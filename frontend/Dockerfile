FROM node:19.1.0-buster-slim

ENV PATH /node_modules/.bin:$PATH

COPY . .
RUN npm install -g npm
RUN npm i --silent

CMD ["npm", "start"]
