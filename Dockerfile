FROM node:14
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
VOLUME [ "/data" ]
EXPOSE 8000
CMD yarn start
