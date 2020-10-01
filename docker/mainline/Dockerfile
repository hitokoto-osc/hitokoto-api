FROM node:14-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY . .
RUN yarn workspaces focus --production
COPY .yarn .
COPY .pnp.js .
VOLUME [ "./data" ]
EXPOSE 8000
CMD yarn start
