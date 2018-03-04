# Hitokoto API
![alt](./img/screenshot.png)
目前该项目是针对 Hitokoto V1 的 PHP 框架的重新实现。
同时更新了以下功能:
* API 请求统计
* callback 函数的支持
* 返回 JS 的支持
* 支持 GBK编码
* 扩展
  * 网易云音乐
  * Bilibili API （待定）

## 依赖
* Redis
* Mysql

## 日记
日记默认保存在 `./logs/Hitokoto-api.log`

## 开始使用
~~环境安装： 参考 [NodeBB](http://docs.nodebb-cn.org) 的环境安装 :D~~

```shell
sudo sh ./install.sh
```

1. `cp config.example.json config.json` 并配置好相关信息（设置 `log_level` 为 `debug`）
3. `pnpm run start` 
4. 进行第一轮测试，访问服务，看看是否存在异常
5. 无异常，将 `log_level` 设置为 `info`
6. `sudo pm2 startup` 使 pm2 开机自启动
7. `sudo pm2 core.js --name hitokoto` pm2 托管 api
8. `sudo pm2 save` 保存列表
9. 配置计划任务: 将 `./update.sh` 加入计划任务 (`crontab -e`, 3小时进行一次)
