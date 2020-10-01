FROM registry.cn-hangzhou.aliyuncs.com/aliyun-node/alinode:5.15.0-alpine
ENV NODE_ENV production
RUN apk add curl
RUN curl -o- -L https://yarnpkg.com/install.sh | sh
RUN export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
WORKDIR /usr/src/app
COPY . .
RUN yarn workspaces focus --production
COPY .yarn .
COPY .pnp.js .
VOLUME [ "./data" ]
EXPOSE 8000
CMD yarn start
