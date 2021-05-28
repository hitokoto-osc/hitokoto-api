FROM node:16-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY . .
RUN yarn workspaces focus --production
COPY . .
# VOLUME [ "./data" ]
EXPOSE 8000
CMD yarn start
