# Hitokoto API
目前该项目是针对 Hitokoto V1 的 PHP 框架的重新实现。
同时更新了以下功能:
* API 请求统计
* callback 函数的支持

## 依赖
* Redis
* Mysql

## 日记
日记默认保存在 `./logs/Hitokoto-api.log`

## 开始使用
环境安装： 参考 [NodeBB](http://doc.nodebb-cn.org) 的环境安装 :D

> `yarn` 可替换为 `npm`, 但并不推荐

1. `cp config.example.json config.json` 并配置好相关信息（设置 `log_level` 为 `debug`）
2. `yarn --production`
3. `yarn start` 
4. 进行第一轮测试，访问服务，看看是否存在异常
5. 无异常，将 `log_level` 设置为 `info`
6. `yarn global add pm2` 使用指令来全局安装 pm2
7. `pm2 startup` 使 pm2 开机自启动
8. `pm2 core.js --name hitokoto` pm2 托管 api
9. `pm2 save` 保存列表
