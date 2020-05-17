FROM node:14
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn --prod && mv node_modules ../
COPY . .
VOLUME [ "./data" ]
COPY "config.example.json" "./data"
EXPOSE 8000
CMD yarn start
