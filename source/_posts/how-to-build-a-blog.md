---
title: "快速低成本的搭建一个马马虎虎的博客"
catalog: true
date: 2017-08-09 19:31:55
subtitle:
header-img: writing.jpeg
tags:
- Blog
- Hexo
- PWA
categories:
- PWA
---

> 本人不是很喜欢写博客，也不是很喜欢鼓捣博客，原因有三：`懒（有空就想睡觉）`， `穷（没钱买主机，没钱买域名）`，`Low（没啥水平没啥干货）`，但是新博客还是开张了，说来也是极其惭愧，这么多年居然一点存货都没有。
>
>不能免俗，今天就低调开坛讲一讲怎么样快速低成本（薅社会主义羊毛）的搭建一个马马虎虎的（像 [https://zoumiaojiang.win](https://zoumiaojiang.win)这样的）博客，并且让更多像我这样的人也逐渐对写博客感兴趣。神马？这样的文章烂大街了？可以先看看大纲先，反正文章在这里，看不看在你咯。
>

我们最近的主要工作就是在倡导国内开发者认识、熟悉 PWA，并且将自己的站点改造成 PWA，或者说服产品设计师将产品逐步升级为 PWA，其实就目前的严峻形势来看，自由度较高，复杂度较低，并且内容更新较少利于缓存的博客是一个非常好的 PWA 应用场景。没错，今天的内容肯定会讲到 PWA 的啦。现在只是想说，我也不是心血来潮想起搞一个博客的，只是想看看，PWA 到底能做成什么样的程度。想一想 PWA 是不是值得大家去探索。

## 静态化站点

`静态化站点` 大家肯定都有所了解了，就是站点内的内容都是由服务端直接输出 HTML 的那种站点，没有任何的异步请求数据，可以理解为 Web 1.0 时代的那种充满了文字和超链接的页面组合而成的站点。说这个干嘛呢？

博客毕竟定位是写文章的，主要的是产出内容，最早期网页的产生也是因为某些科学家们早期有管理文档的需求。所以回想一下，我们真没必要将博客搞一套很复杂的架构，比如 PHP + MySQL + ...？想到这些瞬间又不想搞博客了。比较直观的感受是，今天的自媒体如此疯狂，主要就是因为写作的人只用关心写作而已。那么写博客也是一样，我们仅仅只是想 TMD 写点东西而已啊！

所以，博客采用 `静态化站点` 的方式搭建就顺理成章了。一篇文章一个 html，为这个 html 搞点样式，用 js 写点屌炸天的动画就可以丢给别人看了，一个博客就是一堆 html。然后用各种超链接联系管理起来。看起来还是蛮简单的。

你也许会说：“可是劳资写 html 写样式什么的好费劲啊！”， 没事，咱们有利器帮助咱们搞这个事情。

## Hexo

> **自豪**的说明一下：[本博客](https://zoumiaojiang.win) 是采用 Hexo 搭建的博客。

[Hexo](https://hexo.io) 是一个基于 Node.js 的搭建静态页面博客的工具。我斗胆通俗的给 Hexo 下个定义：“快速自由的开发一个套博客系统，然后让博主专心写博客就好了的一个工具”。我简单的介绍一下 Hexo, 具体的内容可以到 [Hexo 的官网](https://hexo.io) 查找。

### 安装 Hexo

首先你得安装了 [Node.js](https://nodejs.org), [NPM](https://npmjs.org), 等工具，这里就不细讲了。

在命令行中安装：

```yaml
npm install -g hexo
```

这个时候你就拥有了 Hexo 的技能了。可以在命令行中输入 `hexo -h` 验证一下是否安装成功。

### Hexo 用法

简单的讲讲怎么使用 Hexo，这块不是今天这篇文章的重点哈，就简单的介绍一下，具体内容和教程，可以查看 [Hexo 官网](https://hexo.io) 。

#### 初始化一个博客

```yaml
hexo init blog_name
```

执行以上命令，就可以在当前目录下看到一个 `blog_name` 命名的文件夹了。
文件夹目录就是下面这样的：

```yaml
├── scaffolds
├── source
│   └── _posts
└── themes
    └── landscape
        ├── layout
        │   ├── _partial
        │   │   └── post
        │   └── _widget
        ├── scripts
        └── source
            ├── css
            │   ├── _partial
            │   ├── _util
            │   ├── fonts
            │   └── images
            ├── fancybox
            │   └── helpers
            └── js
```

其实就刚才那条简单的 `init` 命令，你的博客系统已经建成了，也就是说，你已经拥有了一个纯静态化的博客了。

#### 预览博客

博客系统已经建好了，可以快速的预览一下：

```yaml
cd blog_name
npm install
# 首次初始化，需要 npm install 安装 hexo 的依赖
hexo server
```

稍等一下之后，跟着提示走，访问 `http://localhost:4000` 就能预览到啦，里面有个 `Hello World` 站点，这个站点就放在 `/source/_posts` 下面的，可以发现是一个 markdown 的文件，也就是说 Hexo 是通过 markdown 写文章的，这样就不用写复杂的 html 啦。

#### 开开心心的写篇文章吧

博客搭建好了，现在可以写篇文章了

```yaml
hexo new 'you-post-title'
```

> 启动 Hexo Server 的时候，会有一个 `hot-reload` 机制的，也就是说，当写文章，新增文章的时候，都不用重新启动 Hexo 的预览服务了。

这时候呢，在 `/source/_posts` 文件夹下就会有一个 `your-post-title.md` 的文件了，这样，就能直接编辑这个 markdown 文件进行写博客啦，神马？不会 markdown 的写法？我友善的丢一个 [markdown 教程](http://wowubuntu.com/markdown/) 给你吧。

现在发现了，原来写博客能这么简单，爽飞。维护一个 Hexo 博客系统只需要关注四部分: source，themes，plugins 还有 `_config.yml`。source 就是文章啦，接下来讲讲 themes 和 plugins。

### Hexo 主题

注意到 `/themes/landspace` 文件夹没有？`landspace` 就是默认的 Hexo 的主题，主题不是简单的样式，是一系列的模版加样式的组合，从而实现将主题从博客书写中抽离出来。神马？嫌弃 `landspace` 丑爆了？没事不要怕，可以 [选一个主题](https://hexo.io/themes/), 放到 `/themes` 文件夹，有精力的可以二次开发改改 layout、样式什么的。等到挑选好了主题后，将主题文件夹放到 `/themes` 下，配置 `_config.yml` 内的 `theme: landscape` 改成你选择主题文件夹名就可以了。这样，你就拥有新主题了，`/themes` 文件夹和其他文件夹是完全独立的，不会因为改变而影响博客的内容的。

> 你也许注意到了，Hexo 采用的是 ejs 前端模版来组织渲染的，如果你想二次开发某个 theme， 就需要对 ejs 有一定的了解，这路就不展开介绍了，不然内容太多了。

由于本人非常没有设计天赋，本博客的主题是基于 [Hux 的博客](https://huangxuan.me) 稍微修改了一些。感谢 Hux。

### Hexo 插件

Hexo 可以理解为一个框架，会做一些基本的编译工作，就是把 markdown 文件编译成 html 文件，然后会生成一个用来部署的 public 文件夹，执行 `hexo generate` 命令就是完成这编译一步的。在这个编译的过程中，我们可能需要有一些特定的需求，比如生成 tags 页面啦，生成 categories 页面等等，这些并不是 Hexo 主框架本身干的事情，这个时候，需要介绍一下 Hexo 的 plugin 机制了。

看一下 Hexo init 后的 `package.json` 文件，`dependencies` 里面的 `hexo-` 前缀的 package 都是 Hexo 的插件，每一个插件都有自己特殊的功能，详见 [Hexo Plugin](https://hexo.io/plugins) 了解每个插件的用法。当然啦，Hexo 作为一个开源的项目，也允许开发者自己开发一些自己的 plugin 提供给其他人使用。对于怎么开发 Hexo 插件，这这里就不详细讲了，内容还是比较多的，后面争取再单独写篇文章详细介绍。

## 部署

Hexo 写文章、换主题什么的应该都交代清楚了，这时候写完文章之后，是要准备部署给别人看了。我们首先来罗列一下，部署一个站点需要哪些东西呢？

- 一个主机【要钱】
- 一个域名【要钱】
- 要部署的纯静态化页面内容【免费】

“可是劳资穷，一分钱都不想花怎么办！”

对于穷这件事情，我本人是深有体会的，我也穷，所以在这个时候就想方设法的薅羊毛了。好在 [github](https://github.com) 提供了一个服务叫做 [GitPage](https://pages.github.com/) 可以帮我们解决主机和域名的事情。

### GitPage

目前很多很多的文档类的站点都是基于 GitPage 做的，节约成本，并且可以用 github 做代码部署，非常方便。
玩转 GitPage 需要有这么几个前提：

- 学会使用 git, 学会 github
- 注册一个 github 账号，注册一个用户名（例如：zoumiaojiang）
- 新建一个仓库叫 `zoumiaojiang.github.io`

然后跟着 GitPage 的 [教程](https://pages.github.com/) push 一些 html 页面和静态资源到 `zoumiaojiang.github.io` 仓库中，就可以访问 `https://zoumiaojiang.github.io/some.html` 访问页面了。

这时候，回想一下，Hexo 编译之后的内容就是一堆 html 和一堆静态资源，这些东西正好可以放在 GitPage 中让别人访问。所以 GitPage 和 Hexo 真的挺合拍。

本博客就是部署在 [https://github.com/zoumiaojiang/zoumiaojiang.github.io](https://github.com/zoumiaojiang/zoumiaojiang.github.io) 上。

### Hexo 部署

讲了这么多，开始干正事吧，可以将 Hexo 构建的内容发布到 GitPage 上了，然后一个简简单单的博客就搭建完成了。Hexo 有个强大的之处，可以通过 `hexo deploy` 命令直接发布到 GitPage 上，通常部署需要做下面几件事情。

#### 修改 _config.yml

首先把 `_config.yml` 的一些基本信息都配置一下，这些在 [Hexo 的官网](https://hexo.io) 都有介绍的。就不详细的介绍了，我们在这里重点介绍一下和部署相关的 `deploy` 配置。

本博客关于 deploy 的配置如下（供大家参考）：

```yaml
# deploy
deploy:
  type: git
  repository: https://github.com/zoumiaojiang/zoumiaojiang.github.io.git
  branch: master


```

#### Hexo 命令操作部署

配置好了 `_config.yml` 的所有配置之后（插件的配置也是需要在 `_config.yml` 上配置的），就可以执行 hexo 命令进行博客的最后部署了。

```yaml
# 部署之前敲下面几行命令
hexo clean
hexo server
hexo generate
hexo deploy
# 打完收工
```

操作完了以上所有操作后，如果不出意外的话，就可以通过访问 `https://zoumiaojiang.github.io` 访问到博客的首页的，应该和 `hexo server` 命令预览的时候一样的。这时候，一个简简单单的博客就上线了，别人可以通过 URL 访问到你的博客。此时只是个穷人版的博客而已，算不上马马虎虎。

### 指定域名

神马？https://zoumiaojiang.github.io 域名太 low？一看就是薅羊毛的，感觉不是很好？凭良心讲，我也是这么觉得的，所以这时候我还是想找一个域名掩盖一下我薅 GitPage 羊毛的事实，所以我决定买一个域名（土豪可以不用做这种心理斗争，甚至可以直接把 Hexo 生成的 public 文件夹直接部署到土豪专用主机哈）。

好吧，我买了一个 `zoumiaojiang.win`，为什么是 `.win`？不是 `.com`, `.me` 什么的？这个我只能告诉你是个人喜好，如果你要是深究的话，我会告诉你：“因为穷，这个冷门的域名 10 年只要 55 RMB”。谁会和毛爷爷过不去呢？

那好，我们现在的需求是，通过访问 [https://zoumiaojiang.win](https://zoumiaojiang.win) 也能访问到博客首页。GitPage 提供了一种可以绑定自定义域名的机制（GitPage 这种好人已经不多了）。在 `zoumiaojiang.github.io` 仓库的根目录下新建一个 `CNAME` 的文件，里面的内容为：

```yaml
zoumiaojiang.win
```

这样 push 到仓库中，不一会，你就会发现，访问 [https://zoumiaojiang.github.io](https://zoumiaojiang.github.io) 的时候直接就会跳转到 [http://zoumiaojiang.win](http://zoumiaojiang.win) 了。可是，这时候由于 `zoumiaojiang.win` 域名 DNS 解析没有配 A 记录， 所以是不会有响应的。

这时候，`ping zoumiaojiang.github.io` ping 一下，拿到 IP, 把域名 DNS 解析新增一个 A 记录指向这个 IP 就行了。等一会，就能访问 [http://zoumiaojiang.win](http://zoumiaojiang.win) 了。

### HTTPS & HTTP/2

现在是 2017 年了，网站不是 HTTPS 和 HTTP/2 的感觉脱离时代了。为了让博客更加的完美，必须要搞一个 HTTPS 环境。可是，我并没有主机啊，没有服务器，怎么配证书？有主机的土豪的 HTTPS 证书可以通过 [Let's Encrypt](https://letsencrypt.org/) 获取免费的，这个地方不深入讲了，可以参考 [HTTPS 环境部署](https://lavas.baidu.com/guide/vue/doc/vue/advanced/https-deploy)。

我们今天介绍另一个免费的东西，不用服务器配置证书，通过 DNS 代理的形式，直接可以做到 HTTPS & HTTP/2 接入，这个东西叫 [cloudflare](https://www.cloudflare.com/)

简单的介绍一下步骤：

- 上 cloudflare 注册一个账号
- 添加你的域名
- 选择 Free Plan
- 根据提示进行一系列的配置（就是些选项）
- 最后会生成两个 DNS 的服务器地址
- 进入你的域名运营商的配置后台，将默认的 DNS 服务配置成 cloudflare 生成的两个 DNS 服务地址

![cloudflare 的配置界面](https://user-images.githubusercontent.com/3365978/29132460-df6fd8be-7d62-11e7-8fd2-2122468454d6.png)

由于 DNS 服务全球更新速度较慢，可能得等个一天两天的服务才能稳定访问。总之，这时候，你的站点已经是 HTTPS & HTTP/2 的站点了。

## 构建 AMP

[AMP](https://www.ampproject.org/zh_cn/learn/overview/) 是 Google 推出的一种网页加速的标准，通过这种标准，可以使你的站点在 Google 搜索结果页（这里是一个忧伤的故事，但是这并不影响我们折腾博客的激情）之后的跳转变得速度超快，具体可以详情见 AMP 的官网，Google 还会对 AMP 的站点有一定的调权，也就是说，如果你的博客提供了 AMP 的页面，将会被 Google 更容易抓取和优先展现，并且能够在 Google 的搜索结果页秒开。

还是很懵逼？什么是 AMP？其实就是一个 HTML 页面，知识遵守 AMP 规范的页面，就想你现在在看的这篇博文，就有 AMP 的版本 [AMP 版本](./amp)。

如何让我们的博客能支持 AMP 呢？

### 引入 hexo-generator-amp 插件

可以使用 hexo-generator-amp 插件来帮助我们构建出 amp 的页面

```yaml
# 在 hexo 博客项目的根目录执行下面的命令
npm install --save hexo-generator-amp
```

此时，博客已经具备生成 AMP 页面的基础了，由于 AMP 是一套独立的页面，hexo-generator-amp 插件只会对 post 的文章生成 AMP 页面，要想验证，只需要在原本 post 的页面的 URL 的基础上在后面加上 `/amp` 即可。

### 配置 _config.yml

hexo-generator-amp 插件是需要从 `_config.yml` 中读取配置才行，配置如下：

```yaml
# amp config
generator_amp:
  templateDir:  amp-template
  assetDistDir: amp-dist
  logo:
    path: sample/sample-logo.png
    width: 600
    height: 60
  substituteTitleImage: 
    path: sample/sample-substituteTitleImage.png
    width: 1024
    height: 800
  warningLog: false   # To display warning, please set true.
```

其中，amp-template 是指明渲染 AMP 页面时候所使用的渲染模版，这种配置表明 AMP 是有一套自己的 theme, 如果想改变默认的 AMP 主题或者其他配置，可以对 amp-template 里面的内容进行二次开发。

### 将 AMP 页面提交 Google 收录

目前 AMP 只能被 Google 搜索引擎所解析执行，所以在我们每写完一篇博客的时候，可以将生成的 AMP URL 提交给 Google 收录（虽然这是一个忧伤的故事，但是能被外国友人轻快速搜索到并且阅读体验好，也是蛮不错的一个自我安慰）。

颇为无奈的抛出一个你可能需要梯子才能够得着的 [Google 的收录入口](https://www.google.com/webmasters/tools/submit-url?hl=zh-CN&pli=1) 。

## 添加 PWA 特性

PWA 是一种渐进式的 Web App, 我们的博客就是一个 Web App, 渐进式的，就是慢慢来，一步一步的将我们的站点的用户体验做到极致。

### 为啥要搞 PWA
博客站点是最适合改造成 PWA 的站点了，博客具有这么几个特点：

- 内容更新不频繁，静态资源可能很久很久很久都不会更新（特别适合做离线缓存）
- 博客是静态化页面（特别适合做整站的离线处理）
- 博客一更新，最好能通知粉丝啦（这个理由真是一点都不违和）
- 博客是个人的，想怎么搞怎么搞（可以尝试更多的 PWA 特性)
- 。。。

@TODO: 这里需要放一个视频，说明一下 PWA 到底有多强大。

### 怎么为博客加 PWA 特性

#### manifest.json

如果为了让博客能够添加到桌面，可以在 Hexo 的博客项目下的 source 目录下增加 manifest.json

```json
{
    "name": "ZouMiaojiang",
    "short_name": "Peace",
    "icons": [
        {
            "src": "/img/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/img/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "start_url": "/",
    "background_color": "#ffffff",
    "display": "standalone",
    "theme_color": "#2874f0"
}
```

这样，你的博客就可以在很多安卓机上被添加到桌面了（当然这个是需要在用户在系统设置里打开开关）。

#### 想 iOS Safari 也稍微好看点的添加到桌面

这时候需要改动 theme 文件夹下的内容了，为了让每个博客页面在 iOS 的 Safari 浏览器下都能被添加到桌面，需要找到 `themes/yourTheme/layout/_partial/head.ejs`，然后在 `<head>` 的里面找个地方塞入如下 html 片段：

```html
   <!-- Add to home screen for Safari on iOS -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="Peace">
    <link rel="apple-touch-icon" href="/img/icons/icon-152x152.png">
    <link rel="shortcut icon" href="<%= config.root %>img/zoumiaojiang.ico">
```

当然啦，图片路径名称换成自己的就好了。

#### Service Worker

上一篇文章 [如何优雅的为 PWA 注册 Service Woker](https://zoumiaojiang.win/2017/07/30/how-regist-service-worker-for-pwa/) 提到了 Service Worker 的坑，在 Webpack 构建环境下，有 sw-register-webpack-plugin 来帮助解决 Service Worker 的注册问题。那么在 Hexo 的开发环境中，我们也可以借助 `hexo-service-worker` 插件来解决博客的 Service Worker 的注册问题。

#### hexo-servcie-worker

在弄博客的时候，找到了一个 `hexo-offline` 的 hexo 插件，特别好用，Service Worker 能够正常注册，但是这个插件只是考虑到了基本的 Service Worker 的文件生成和注册，没有关系实时性，用户友好等方面的问题，所以我就自己写了个 [hexo-service-worker](https://github.com/lavas-project/hexo-service-worker) 的插件。

> 其中有部分 sw-precache 相关的内容是参考 `hexo-offline` 插件的，表示感谢🙏。

使用这个插件很简单，首先是安装插件：

```yaml
npm install --save hexo-service-worker
```

然后就是修改 `_config.yml` 让插件生效，通常我们的配置如下：

```yaml
# service worker
service_worker:
  maximumFileSizeToCacheInBytes: 5242880
  staticFileGlobs:
    - public/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff,woff2}
  stripPrefix: public
  verbose: true
  runtimeCaching:
    - urlPattern: /*
      handler: cacheFirst
      options:
        origin: cdn.a.org
    - urlPattern: /*
      handler: cacheFirst
      options:
        origin: cdn.b.com
```

其中 `runtimeCaching` 的配置是专门针对第三方 CDN 资源的缓存的配置。

Service Worker 的生效必须依赖 HTTPS 的，想要对 Service Worker 有具体的了解可以 [戳这](https://lavas.baidu.com/doc/offline-and-cache-loading/service-worker/service-worker-introduction) 。

## 提供高质量的内容

这一节，没什么好说的了，就一句话：“博客没货，再好看，速度再快也没用。”

最后感谢 github, 提供了 GitPage 这么好的东西，无以为报，只能怒提代码，多提代码了。