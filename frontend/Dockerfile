FROM node:19.1.0-buster-slim

WORKDIR /frontend
ENV PATH /frontend/node_modules/.bin:$PATH
RUN npm install -g npm

COPY . /frontend/
RUN npm i --silent

CMD ["npm", "start"]
