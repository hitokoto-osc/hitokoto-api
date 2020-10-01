FROM registry.cn-hangzhou.aliyuncs.com/aliyun-node/alinode:latest
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY . .
RUN yarn workspaces focus --production && mv .yarn .pnp.js .
VOLUME [ "./data" ]
EXPOSE 8000
CMD yarn start
