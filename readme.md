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
日记默认保存在 `./data/logs/Hitokoto-api.log`

## 开始使用
### 常规使用
首先配置好 Node.js 环境（>=12.x)，以及 `yarn`。
1. 克隆仓库 `git clone https://github.com/hitokoto-osc/hitokoto-api.git your_workdir`
2. 进入仓库 `cd your_workdir`
3. 安装依赖 `yarn`
4. 复制配置 `cp config.example.json ./data/config.json`，根据需要对其进行配置。
5. 启动程序 `yarn start`

### 容器使用
* 常规使用（需要预先安装好 redis），由于使用共享网络，请留意 8000 端口是否被占用。
```shell
docker run \
-v /path/to/your/data/dir:/usr/src/app/data \
--network host \
hitokoto/api
```
其他高深玩法（比如说不共享网络），还请自己摸索。
* 我们提供 docker-compose 配置（提供 redis 依赖），有需要的可以自行下载使用。
