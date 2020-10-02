FROM registry.cn-hangzhou.aliyuncs.com/aliyun-node/alinode:v5.16.0-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY . .
# RUN yarn workspaces focus --production
RUN npm i --production
COPY . .
VOLUME [ "./data" ]
EXPOSE 8000
CMD npm start
