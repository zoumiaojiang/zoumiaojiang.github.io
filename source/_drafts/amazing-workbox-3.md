---
title: 神奇的 Workbox 3.0
catalog: true
subtitle: 让你的 Web 站点轻松做到离线可访问
header-img: workbox.jpg
tags:
- Service Worker
- PWA
- Workbox
categories:
- PWA
---

[Workbox](https://github.com/GoogleChrome/workbox) 是 GoogleChrome 团队推出的一套 Web App 静态资源本地存储的解决方案，该解决方案包含一些 Js 库和构建工具，在 Chrome Submit 2017 上首次隆重面世。而在 Workbox 背后则是 [Service Worker]() 和 [Cache API]() 等技术和标准在驱动。在 Workebox 之前，GoogleChrome 团队较早时间推出过 [sw-precache]() 和 [sw-toolbox]() 库，但是在 GoogleChrome 工程师们看来，Workbox 才是真正能方便统一的处理离线能力的更完美的方案，所以停止了对 sw-precache 和 sw-toolbox 的维护。

从 sw-precache 和 sw-toolbox 的相关 issue 来看，众多开发者对它们也是颇有怨言。但是 workbox 发布了 2.x 版本后其实反响一般，总的来说还是 API 太混乱了，虽然功能很强大但是设计条理不清晰导致很难推广开，但是从 Workbox3 alpha 版本的文档和 API 来看，我个人认为 Workbox3 终于是能够很方便简单的解决 Service Worker 绝大多数问题的神器了，所以写这篇文章全面介绍一下。

> 注意，当前 Workbox 3 还是 alpha 发布阶段，API 和接口还有可能调整，文中所提到的一些工具可能 Google 方面还没有完全 ready, 本文为正式发布前的尝鲜版，后续正式发布后本会跟进。

## 概述

Workbox 现在已经发布到了 3.0 alpha 版本，的先了解一下 Workbox：

- 不管你的站点是何种方式构建的，都可以为你的站点提供离线访问能力。
- 就算你不考虑离线能力，也能让你的站点访问速度更加快。
- 几乎不用考虑太多的具体实现，只用做一些配置。
- 简单却不失灵活，可以完全自定义相关需求（支持 Service Worker 相关的特性如 Web Push, Background sync 等）
- 针对各种应用场景的多种缓存策略

bingo！ 如果你被这些特性吸引住了，可以往下看看，我们在这里讲的是 Workbox 3.0 的内容，当然 Workbox 在解决的核心问题方面和之前的版本没有太大的出入，只是 API 进行了一些调整，并且在构建相关方面考虑的更加完善，Workbox 进入 3.0 以后，API 看起来清晰多了，接下来一起看看 Workbox 3 具体内容吧。

## 用法

想要使用 Workbox，首先需要在你的项目中创建一个 Service Worker 文件 `sw.js` 并且在你的站点上注册：

```html
<script>
// 可以这么注册 Service Worker
if ('serviceWorker' in navigator) {
    // 为了保证首屏渲染性能，可以在页面 load 完之后注册 Service Worker
    window.onload = function () {
        navigator.serviceWorker.register('/sw.js');
    };
}
</script>
```

有了 `sw.js` 之后就可以使用 Workbox 了，你只需要在 `sw.js` 中导入 Workbox 就可以使用了：

```js
// Workbox 2.x 是将 workbox 核心内容放在 workbox-sw 包里维护的
// Workbox 3.x 开始是将 workbox 核心 lib 放在 CDN 维护
// 当然也可以挪到自己的 CDN 维护
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0-alpha.3/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);
}
else {
    console.log(`Boo! Workbox didn't load 😬`);
}
```

当在 `sw.js` 能够拿到 `workbox` 全局变量，表明 Workbox 可以使用了，Workbox 能干什么呢？

- 通过 `workbox.precaching` 模块来处理 Service Worker 静态资源的预缓存。
- 通过 `workbox.routing` 模块提供的路由控制和 `workbox.strategies` 模快提供的缓存策略控制帮助你做动态缓存。
- 使用 Workbox 插件做一些 Service Worker 相对独立的工作，比如 更新提醒, Background Sync 等

## precache (预缓存) 静态文件

如果你有一些静态资源是需要永远的离线缓存，除非重新上线才更新缓存的话，那 precache 预缓存应该是你所期待的，如果了解 Service Worker 的生命周期的话，precache 的工作是在 Service Worker `install` 时候通过 Cache API 完成的，具体可以了解 [Service Work 生命周期]()。

Workbox 提供了一种非常方便的 API 帮助我们解决 precache 的问题，和之前 Google 的 precache 方案 sw-precache 的工作类似。Workbox 通过使用 `precaching.precacheAndRoute` 接口完成 precache 操作：

```js
workbox.precaching.preacheAndRoute([
    '/styles/index.0c9a31.css',
    '/scripts/main.0d5770.js',
    {
        url: '/index.html',
        revision: '383676'
    },
]);
```

以上这段代码会在 Service Worker 安装成功的时候下载 `/styles/index.0c9a31.css`， `/scripts/main.0d5770.js`, `/index.html` 文件，并且会以构造路由的方式将这些文件都存储到 Cache Storage 中。这个传入的数组其实就是预缓存内容列表，有两种形式，一种是直接写文件名的字符串（带 Hash 的），一种是如下所示带有 url 和 revesion 值的对象：

```js
{
    url: '将要预缓存的文件 URL,
    revision: '文件内容的 Hash 值'
}
```

> 这里需要注意的是这个 revision 的值，当预缓存的文件就任何变动的时候就会被更新，如果 revision 没有更新，那当你更新 Service Worker 的时候，被缓存的文件也不会被更新。

我们接下来介绍一些帮助我们生成预缓存内容列表的 `precaching.precacheAndRoute` API 的配置选项。

### 处理 `/` 和 `/index.html`

通常当用户访问 `/` 时，对应的访问的页面 HTML 文件是 `/index.html`，默认情况下，precache 路由机制会在任何 URL 的结尾的 `/` 后加上 `index.html`，这就以为着你预缓存的任何 `index.html` 都可以通过 `/index.html` 或者 `/` 访问到。

当然，你也可以通过 `directoryIndex` 参数禁用掉这个默认行为：

```js
workbox.precaching.preacheAndRoute(
    [
        '/styles/index.0c9a31.css',
        '/scripts/main.0d5770.js',
        {
            url: '/index.html',
            revision: '383676'
        },
    ],
    {
        directoryIndex: null
    }
);
```

### 忽略请求参数

例如，如果我么想要让 `key1` 参数不是 `/example.html?key1=1&key2=2` 的一部分，你只需要设置 `ignoreURLParametersMatching` 参数把它排除掉：

```js
workbox.precaching.precacheAndRoute(
    [
        {
            url: '/example.html?key2=2',
            revision: '6821e0'
        }
    ],
    {
        ignoreUrlParametersMatching:[/key1/],
    }
);
```

这样 `/example.html?key1=1&key2=2` 这个路由对应的内容就可以被预缓存了。

### 生成预缓存列表

靠手动维护 `precache.precacheAndRoute` API 中的预缓存内容列表是不可能的，revision 我们无法手动维护，所以我们肯定是要借助一些工具来干这个事情，好在 Workbox 提供了多种方式让我们选择：

- workbox 命令行
- workbox-build npm 包
- workbox-webpack-plugin

在使用以上三种方式生成预缓存内容列表之前，我们先预设一下应用场景：假设你的项目在目录 `/app` 下，必须保证在你的项目根目录下有一个 `app/sw.js` 包含以下内容：

```js
// 通常项目中的 sw.js 源文件都是通过这样预留一个空数组的方式来预缓存内容列表的
workbox.precaching.precacheAndRoute([]);
```

这样才能保证能将生成的预缓存内容列表内容注入到 Service Worker 文件中。

#### workbox 命令行

Workbox 提供了一套命令行，专门来帮助我们注入预缓存内容列表，可以帮助我们生成注入预缓存内容列表所需要的 `workbox-cli-config.js` 配置文件，然后通过命令行使用配置文件就可以生成一个预缓存列表的代码并注入到之前自定义的 `app/sw.js` 文件中，最终编译成线上所需要的  Service Worker 文件：`dist/sw.js`。

安装命令行：

```bash
npm install -g workbox-cli
```

所以我们先要有一个 `workbox-cli-config.js` 文件，然后根据这个文件结合 `/app/sw.js` 源文件来生成一个含有预缓存列表的 `dist/sw.js` 文件。接下来我们可以看下具体这一系列流程需要怎么操作。

首先执行 `workbox generate:sw` 命令生成一个配置文件 `workbox-cli-config.js`，这个命令执行之后将会弹出一些问题让你选择，如下所示:

```bash
>$ workbox generate:sw
? What is the root of your web app? app
? Which file types would you like to cache? (Press <space> to select, <a> to toggle all, <i> to inverse selection)html,ico,svg,png,js,css
? What should the path of your new service worker file be (i.e. './build/sw.js')? dist/sw.js
? Last Question - Would you like to save these settings to a config file? Yes
```

回答完这些问题之后你就可以在你的项目里导出一个新的 `workbox-cli-config.js` 配置文件了大概长以下这个样子：

```js
// workbox-config.js
module.exports = {
    "globDirectory": "app/",
    "globPatterns": [
        "**/*.{html,ico,svg,png,js,css}"
    ],
    "swDest": "dist/sw.js",
    "swSrc": "app/sw.js"
};
```

拿到了 `workbox-cli-config.js` 配置文件之后可以执行 `workbox inject:manifest workbox-cli-config.js` 命令生成编译后的 `dist/sw.js` 文件了，这一步干的事情就是把预缓存内容列表注入到 `app/sw.js` 中，一般只有在上线前才用命令行注入预缓存内容列表，通常我们都不会手动去执行这些命令的，比较合理的做法是实现生成好 `workbox-cli-config.js` 文件，然后在构建脚本中配置上自动执行 `workbox inject:manifest` 命令。

> `workbox inject:manifest` 命令的做法就是去匹配 `/app/sw.js` 中的 `workbox.precaching.precacheAndRoute([])` 方法的正则，然后通过 replace 内容注入的，可以参考下面的 workbox-build 的介绍。

#### workbox-build

使用命令行总感觉太傻了，操作步骤也比较繁琐，为了使得预缓存工作更加简便灵活，Workbox 也提供了一个 NPM 包 -- [workbox-build](https://www.npmjs.com/package/workbox-build)，你可以在任何构建工具中都使用。

可以在你的工程根目录中执行以下命令安装 workbox-build 包：

```bash
npm install --save-dev workbox-build
```

然后直接可以在你想要处理 Service Worker 预缓存的地方引入 workbox-build 库，并且调用其 `injectManifest` 方法：

```js
const workboxBuild = require('workbox-build');

workboxBuild.injectManifest({
    swSrc: path.join(__dirname, 'app', 'sw.js'),
    swDest: path.join(__dirname, 'dist', 'sw.js'),
    globDirectory: './dist/',
    globPatterns: ['**\/*.{html,js,css}'],
    globIgnores: ['admin.html'],
    templatedUrls: {
        '/shell': ['dev/templates/app-shell.html', 'dev/**\/*.css'],
    },

    // 要替换的预留代码区正则
    injectionPointRegexp: /(\.precacheAndRoute\()\s*\[\s*\]\s*(\))/,
})
.catch(err => {
    console.error(`Unable to inject the precache manifest into sw.js`);
    throw err;
});
```

在构建文件中执行这段代码就会读取 `app/sw.js` 文件然后生成一个 `dist/sw.js` 文件含有注入的预缓存内容列表。

> 关于如何使用 `injectManifest` 方法可以查看 workbox-build 的 `injectManifest` 方法 [全部参数](https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.injectManifest)

#### workbox-webpack-plugin

有了 workbox-build 可想而知就能搞出很多实用的预缓存插件方案，比如 Webpack、Gulp 等插件，Workbox 官方也提供了一个插件 `workbox-webpack-plugin`，只需要通过以下方式，就可以将插件安装到你的 webpack 项目中：

```bash
npm install --save-dev workbox-webpack-plugin
```

然后就只需要将插件添加到 Webpack 配置中就可以正常使用了，插件参数和 workbox-build 的 `injectManifest` 方法保持一致：

```js
const workboxPlugin = require('workbox-webpack-plugin');

// ...
webpack({
    plugins: [
        // ...
        new workboxPlugin({
            swSrc: './src/sw.js',
            swDest: './dist/sw.js',
            globDirectory: './dist/',
            globPatterns: ['**/*.{html,js,css}'],
        })
    ]
    // ...
});
```

这里有个地方和之前提到的替换预留的 `app/sw.js` 不一样：使用 Workbox 提供的 Webpack 插件必须在 `app/sw.js` 中包含以下代码才能完成预缓存内容列表注入工作

```js
workbox.precaching.precacheAndRoute(self.__precacheManifest || []);
```

当插件跑起来之后，会在 `/dist/sw.js` 中增加一段 `importScripts()` 代码用来引入一个模块，这个模块的内容就是 `self.__precacheManifest`，也就是预缓存内容列表的内容，具体的效果可以在项目中使用 `workbox-webpack-plugin` 尝试一下，看看 build 后的 `dist/sw.js` 结果就会比较清楚了。

## 路由请求缓存

路由请求缓存是通过文件路由匹配的模式分别对制定的路由文件做不同策略缓存的方式，这部分工作可以在 `app/sw.js` 中直接使用 workbox 提供的 `workbox.routing.registerRoute` API 完成，这个 API 可以理解为干了两件事情，**一、通过请求路由配置匹配到指定待缓存文件或请求内容**，**二、通过第二个参数的处理回调函数决定用何种策略来缓存匹配上的文件**。有 **三种** 方法可以通过 workbox-route 来匹配一个请求 URL

- 字符串方式

```js
// 可以直接是当前项目下的绝对路径
workbox.routing.registerRoute(
    '/logo.png',
    handler // handler 是做缓存策略的回调函数，通常指后面所会降到的 '缓存策略函数'
);

// 也可以是完整的带完整 host 的 URL 路径，这里的 URL 必须是 https 的
workbox.routing.registerRoute(
    'https://some-host/some-path/logo.png',
    handler
);

```

- 正则表达式方式

```js
workbox.routing.registerRoute(
    new RegExp('.*\.js'), // 这里是任何正则都行，只要能匹配得上的请求路由地址
    handler
);
```

- 回调函数方式

```js
// 通过回调函数来匹配请求路由将会让策略更加灵活
const matchFunction = ({url, event}) => {
    // 如果请求路由匹配了就返回 true
    return false;
};

workbox.routing.registerRoute(
    matchFunction,
    handler
);
```

上面讲到了匹配请求路由的三种方式，接下来可以讲讲如何处理匹配上的请求所返回的内容，也就是上面三种路由匹配方式的 handler，通常有两种做法：

- 使用一种 Workbox 通过 `workbox.strategies` API 提供的 **缓存策略**。
- 提供一个自定义返回带有返回结果的 Promise 的回调方法。

### 路由请求缓存策略

下面介绍一下 Workbox 默认提供的几种缓存策略 API，这些 API 可以被当成 handler 使用。

#### Stale While Revalidate


#### Network First

#### Cache First

#### Network Only

#### Cache Only

### 自定义处理请求返回内容

## 第三方 CDN 缓存

## Workbox 配置

## Workbox 插件

插件应该是 3.0 最大的改进了，在 2.x 中，现有的插件大部分都是以 API 直接抛给开发者，让开发者一头雾水，现在 3.0 中每个插件自己封装了之前的 API，对开发者来说专门解决了一个个独立的问题，除此之外，还提供插件扩展机制可以自行封装。

### 如何使用

下面先看看如何使用 Workbox 插件：

### 自定义插件

## 如何 debugger

## 最佳实践
