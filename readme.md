# Hitokoto API

![alt](./img/screenshot.png)
  
![Node.js CI](https://github.com/hitokoto-osc/hitokoto-api/workflows/Node.js%20CI/badge.svg?branch=master) [![DeepScan grade](https://deepscan.io/api/teams/9730/projects/12316/branches/188710/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=9730&pid=12316&bid=188710) [![Code Climate](https://codeclimate.com/github/hitokoto-osc/hitokoto-api/badges/gpa.svg)](https://codeclimate.com/github/hitokoto-osc/hitokoto-api)  

本项目是基于 Teng-koa 实现的一言接口程序。相较于单纯的一言程序，此框架提供了扩展性。
  
以下是相对于 v0 （PHP 版本）新加入的功能：
  
* 请求统计
* 支持返回 JS 回调函数
* 支持 length 区间返回
* 返回 JS 的支持
* 支持 GBK 编码
* 开源数据集
* 支持遥测
* 支持多进程运行
* A/B 无感知更新数据
* 官方扩展
  * 网易云音乐
  
我们一直致力于框架的可维护性与可扩展性，这也是为什么我们选择下一版本（v2）将使用 Go 编写。  
由于历史问题，此框架存在着很多不足（需要重构）的地方，我们将分 2 个大版本完全重构掉这些问题（基于 Alinode, DeepScan, CodeClimate 分析结果)
  
> **关于贡献**  
> 您可以关注我们的开发者文档，我们在其中简单介绍了本框架的基本运作机理，这将会使你为此框架开发扩展异常容易（比如：加一个 QQ 音乐接口）
  
## 外部依赖

* Redis
  
## 日记

* 调试日记，警告信息都会打印在 `Console`
* 日记文件只保存 `error`，保存在 `./data/logs/hitokoto_error.log`

## 开始使用

### 常规使用

首先配置好 Node.js 环境（>=16.x)，以及 `yarn`。  
**请注意：本项目使用 Yarn v2，因此使用前请将你的 Yarn 版本更新至 v1.22.4 或更高版本。此外，项目目前不支持使用 NPM，CNPM，PNPM管理包依赖。**  

1. 克隆仓库 `git clone https://github.com/hitokoto-osc/hitokoto-api.git your_workdir`
2. 进入仓库 `cd your_workdir`
3. 安装依赖 `yarn workspaces focus --production`
4. 复制配置 `cp config.example.yml ./data/config.yml`，根据需要对其进行配置。
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

## Benchmark

以下数据仅供参考。测试环境为 Windows 10 20H2 x64, WSL 1. 实例启用了 8 个 Workers。由于是单机测试（而且不是 Ubuntu 真机），所以数据是娱乐数据。

```shell
$ node -v
v16.1.0
$ wrk -t8 -c1000 -d10s --latency http://127.0.0.1:8000
Running 10s test @ http://127.0.0.1:8000
  8 threads and 1000 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    85.06ms   18.51ms 180.85ms   74.85%
    Req/Sec     1.47k   222.90     2.30k    82.00%
  Latency Distribution
     50%   87.66ms
     75%   95.61ms
     90%  104.91ms
     99%  124.37ms
  117210 requests in 10.06s, 125.89MB read
Requests/sec:  11650.18
Transfer/sec:     12.51MB
$ screenfetch
                          ./+o+-       root@DESKTOP-89TMCM6
                  yyyyy- -yyyyyy+      OS: Ubuntu 20.04 focal(on the Windows Subsystem for Linux)
               ://+//////-yyyyyyo      Kernel: x86_64 Linux 4.4.0-19041-Microsoft
           .++ .:/++++++/-.+sss/`      Uptime: 2d 22h 26m
         .:++o:  /++++++++/:--:/-      Packages: 712
        o:+o+:++.`..```.-/oo+++++/     Shell: fish 3.2.2
       .:+o:+o/.          `+sssoo+/    Disk: 540G / 625G (87%)
  .++/+:+oo+o:`             /sssooo.   CPU: Intel Core i7-10875H @ 16x 2.304GHz
 /+++//+:`oo+o               /::--:.   RAM: 11965MiB / 16288MiB
 \+/+o+++`o++o               ++////.
  .++.o+++oo+:`             /dddhhh.
       .+.o+oo:.          `oddhhhh+
        \+.++o+o``-````.:ohdhhhhh+
         `:o+++ `ohhhhhhhhyo++os:
           .o:`.syhhhhhhh/.oo++o`
               /osyyyyyyo++ooo+++/
                   ````` +oo+++o\:
                          `oo++.
```
