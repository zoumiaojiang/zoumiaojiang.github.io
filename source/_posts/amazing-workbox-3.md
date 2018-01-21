---
title: 神奇的 workbox 3.0
subtitle: 让你的 Web 站点轻松做到离线可访问
catalog: true
header-img: workbox.jpg
tags:
  - Service Worker
  - PWA
  - Workbox
categories:
  - PWA
date: 2018-01-16 00:45:20
---

[workbox](https://github.com/GoogleChrome/workbox) 是 GoogleChrome 团队推出的一套 Web App 静态资源和请求结果的本地存储的解决方案，该解决方案包含一些 Js 库和构建工具，在 Chrome Submit 2017 上首次隆重面世。而在 workbox 背后则是 [Service Worker](https://lavas.baidu.com/pwa/offline-and-cache-loading/service-worker/service-worker-introduction) 和 [Cache API](https://developer.mozilla.org/zh-CN/docs/Web/API/Cache) 等技术和标准在驱动。在 Workebox 之前，GoogleChrome 团队较早时间推出过 [sw-precache](https://github.com/GoogleChromeLabs/sw-precache) 和 [sw-toolbox](https://github.com/GoogleChromeLabs/sw-toolbox) 库，但是在 GoogleChrome 工程师们看来，workbox 才是真正能方便统一的处理离线能力的更完美的方案，所以停止了对 sw-precache 和 sw-toolbox 的维护。

从 sw-precache 和 sw-toolbox 的相关 issue 来看，众多开发者对它们也是颇有怨言。但是 workbox 发布了 2.x 版本后其实反响一般，总的来说我认为还是 API 太混乱了，虽然功能很强大但是设计条理不清晰，其学习成本导致很难推广开，但是从目前 workbox3 alpha 版本的文档和 API 来看，我个人认为 workbox3 终于成为了能够很方便简单的解决 Service Worker 绝大多数问题的神器，所以写这篇文章来全面介绍一下。

> 注意，当前 workbox 3 还是 alpha 发布阶段，API 和接口还有可能调整，文中所提到的一些工具可能 Google 方面还没有完全 ready, 本文为正式发布前的尝鲜版，后续正式发布后本会随版更新。

## 概述

workbox 现在已经发布到了 3.0 alpha 版本，我们可以先了解一下 workbox：

- 不管你的站点是何种方式构建的，都可以为你的站点提供离线访问能力。
- 就算你不考虑离线能力，也能让你的站点访问速度更加快。
- 几乎不用考虑太多的具体实现，只用做一些配置。
- 简单却不失灵活，可以完全自定义相关需求（支持 Service Worker 相关的特性如 Web Push, Background sync 等）。
- 针对各种应用场景的多种缓存策略。

bingo！ 如果你被这些特性吸引住了，可以往下看看，我们在这里讲的是 workbox 3.0 的内容，当然 workbox 在解决的核心问题方面和之前的版本没有太大的出入，只是 API 进行了一些调整，并且在构建相关方面考虑的更加完善，workbox 进入 3.0 以后，API 看起来清晰多了，接下来一起看看 workbox 3 具体内容吧。

## 用法

想要使用 workbox，首先需要在你的项目中创建一个 Service Worker 文件 `sw.js` 并且在你的站点上注册：

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

有了 `sw.js` 之后就可以使用 workbox 了，你只需要在 `sw.js` 中导入 workbox 就可以使用了：

```js
// workbox 2.x 是将 workbox 核心内容放在 workbox-sw node_modules 包里维护的
// workbox 3.x 开始是将 workbox 核心 lib 放在 CDN 维护
// 当然也可以挪到自己的 CDN 维护
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0-alpha.3/workbox-sw.js');

if (workbox) {
    console.log(`Yay! workbox is loaded 🎉`);
}
else {
    console.log(`Boo! workbox didn't load 😬`);
}
```

当在 `sw.js` 能够拿到 `workbox` 全局变量，表明 workbox 可以使用了，workbox 能干什么呢？

- 通过 `workbox.precaching` 模块来处理 Service Worker 静态资源的预缓存。
- 通过 `workbox.routing` 模块提供的路由控制和 `workbox.strategies` 模快提供的缓存策略控制帮助你做动态缓存。
- 使用 workbox 插件做一些 Service Worker 相对独立的工作，比如 更新提醒, Background Sync 等

## precache (预缓存) 静态文件

如果你有一些静态资源是需要永远的离线缓存，除非重新上线才更新缓存的话，那 precache 预缓存应该是你所期待的，如果了解 Service Worker 的生命周期的话，precache 的工作是在 Service Worker `install` 时候通过 Cache API 完成的，具体可以了解 [Service Work 生命周期](https://lavas.baidu.com/pwa/offline-and-cache-loading/service-worker/service-worker-lifecycle)。

workbox 提供了一种非常方便的 API 帮助我们解决 precache 的问题，和之前 Google 的 precache 方案 sw-precache 的工作类似。workbox 通过使用 `precaching.precacheAndRoute` 接口完成 precache 操作：

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

靠手动维护 `precache.precacheAndRoute` API 中的预缓存内容列表是不可能的，revision 我们无法手动维护，所以我们肯定是要借助一些工具来干这个事情，好在 workbox 提供了多种方式让我们选择：

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

workbox 提供了一套命令行，专门来帮助我们注入预缓存内容列表，可以帮助我们生成注入预缓存内容列表所需要的 `workbox-cli-config.js` 配置文件，然后通过命令行使用配置文件就可以生成一个预缓存列表的代码并注入到之前自定义的 `app/sw.js` 文件中，最终编译成线上所需要的  Service Worker 文件：`dist/sw.js`。

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

使用命令行总感觉太傻了，操作步骤也比较繁琐，为了使得预缓存工作更加简便灵活，workbox 也提供了一个 NPM 包 -- [workbox-build](https://www.npmjs.com/package/workbox-build)，你可以在任何构建工具中都使用。

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

有了 workbox-build 可想而知就能搞出很多实用的预缓存插件方案，比如 Webpack、Gulp 等插件，workbox 官方也提供了一个插件 `workbox-webpack-plugin`，只需要通过以下方式，就可以将插件安装到你的 webpack 项目中：

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

这里有个地方和之前提到的替换预留的 `app/sw.js` 不一样：使用 workbox 提供的 Webpack 插件必须在 `app/sw.js` 中包含以下代码才能完成预缓存内容列表注入工作

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
    // 如果请求路由匹配了就返回 true，也可以返回一个参数对象以供 handler 接收处理
    return false;
};

workbox.routing.registerRoute(
    matchFunction,
    handler
);
```

上面讲到了匹配请求路由的三种方式，接下来可以讲讲如何处理匹配上的请求所返回的内容，也就是上面三种路由匹配方式的 handler，通常有两种做法：

- 使用一种 workbox 通过 `workbox.strategies` API 提供的 **缓存策略**。
- 提供一个自定义返回带有返回结果的 Promise 的回调方法。

### 路由请求缓存策略

下面介绍一下 workbox 默认提供的几种缓存策略 API，这些 API 可以被当成 handler 使用。

**Stale While Revalidate**

这种策略的意思是当请求的路由有对应的 Cache 缓存结果就直接返回，在返回 Cache 缓存结果的同时会在后台发起网络请求拿到请求结果并更新 Cache 缓存，如果本来就没有 Cache 缓存的话，直接就发起网络请求并返回结果，这对用户来说是一种非常安全的策略，能保证用户最快速的拿到请求的结果，但是也有一定的缺点，就是还是会有网络请求占用了用户的网络带宽。可以像如下的方式使用 `State While Revalidate` 策略：

```js
workbox.routing.registerRoute(
    match, // 匹配的路由
    workbox.strategies.staleWhileRevalidate()
);
```

**Network First**

这种策略就是当请求路由是被匹配的，就采用网络优先的策略，也就是优先尝试拿到网络请求的返回结果，如果拿到网络请求的结果，就将结果返回给客户端并且写入 Cache 缓存，如果网络请求失败，那最后被缓存的 Cache 缓存结果就会被返回到客户端，这种策略一般适用于返回结果不太固定或对实时性有要求的请求，为网络请求失败进行兜底。可以像如下方式使用 `Network First` 策略：

```js
workbox.routing.registerRoute(
    match, // 匹配的路由
    workbox.strategies.networkFirst()
);
```

**Cache First**

这个策略的意思就是当匹配到请求之后直接从 Cache 缓存中取得结果，如果 Cache 缓存中没有结果，那就会发起网络请求，拿到网络请求结果并将结果更新至 Cache 缓存，并将结果返回给客户端。这种策略比较适合结果不怎么变动且对实时性要求不高的请求。可以像如下方式使用 `Cache First` 策略：

```js
workbox.routing.registerRoute(
    match, // 匹配的路由
    workbox.strategies.cacheFirst()
);
```

**Network Only**

比较直接的策略，直接强制使用正常的网络请求，并将结果返回给客户端，这种策略比较适合对实时性要求非常高的请求。可以像如下方式使用 `Network Only` 策略：

```js
workbox.routing.registerRoute(
    match, // 匹配的路由
    workbox.strategies.networkOnly()
);
```

**Cache Only**

这个策略也比较直接，直接使用 Cache 缓存的结果，并将结果返回给客户端，这种策略比较适合一上线就不会变的静态资源请求。可以像如下方式使用 `Cache Only` 策略：

```js
workbox.routing.registerRoute(
    match, // 匹配的路由
    workbox.strategies.networkOnly()
);
```

无论使用何种策略，你都可以通过自定义一个缓存来使用或添加插件（后面我们会介绍 workbox 插件）来定制路由的行为（以何种方式返回结果）。

```js
workbox.strategies.staleWhileRevalidate({
    // 使用用户自定义的缓存名称
    cacheName: 'my-cache-name',

    // 使用 workbox 插件
    plugins: [
        // ...
    ]
});
```

当然，这些配置通常需要在缓存请求时更安全，也就是说，需要限制缓存的时间或者确保设备上用的数据是被限制的。

### 自定义策略

如果以上的那些策略都不太能满足你的请求的缓存需求，那就得想想办法自己定制一个合适的策略，甚至是不同情况下返回不同的请求结果，workbox 也考虑到了这种场景（这也是为什么我会极力推荐 workbox 的原因），当然，最简单的方法是直接在 Service Worker 文件里通过最原始的 `fetch` 事件控制缓存策略。也可以使用 workbox 提供的另一种方式：传入一个带有对象参数的回调函数，对象中包含匹配的 `url` 以及请求的 `fetchEvent` 参数，回调函数返回的就是一个 response 对象，具体用法如下所示：

```js
workbox.routing.registerRoute(
    ({url, event}) => {
        return {
            name: 'workbox',
            type: 'guide',
        };
    },
    ({url, event, params}) => {
        // 返回的结果是：A guide on workbox
        return new Response(
            `A ${params.type} on ${params.name}`
        );
    }
);
```

## 第三方请求的缓存

如果有些请求的域和当前 Web 站点不一致，那可以被认为是第三方资源或请求，针对第三方请求的缓存，因为 Workbox 无法获取第三方路由请求的状态，当请求失败的情况下 workbox 也只能选择缓存错误的结果，所以 workbox 3 原则上默认不会缓存第三方请求的返回结果。也就是说，默认情况下如下的缓存策略是不会生效的：

```js
workbox.routing.registerRoute(
    'https://notzoumiaojiang.com/example-script.min.js',
    workbox.strategies.cacheFirst(),
);
```

当然，并不是所有的策略在第三方请求上都不能使用，workbox 3 可以允许 `networkFirst` 和 `stalteWhileRevalidate` 缓存策略生效，因为这些策略会有规律的更新缓存的返回内容，毕竟每次请求后都会更新缓存内容，要比直接缓存安全的多。

> 如果你强制使用 workbox 3 不推荐的缓存策略去缓存第三方请求，那 workbox 在 DevTools 里的 console 中会报警报哦。

如果你还是执意要缓存第三方请求的结果的话，workbox 3 也考虑到了确实会有这种难以扼杀的需求，提供了一个非常人性化的方式满足需求：利用 `workbox.cacheableResponse.Plugin` 来指定只缓存请求成功的结果，这样就打消掉我们之前对于不安全结果被缓存的顾虑了。鹅妹子英！(后面我们会介绍插件机制)

```js
workbox.routing.registerRoute(
    'https://notzoumiaojiang.com/example-script.min.js',
    workbox.strategies.cacheFirst({
        plugins: [
            // 这个插件是让匹配的请求的符合开发者指定的条件的返回结果可以被缓存
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            })
        ]
    }),
);
```

## workbox 配置

workbox 3 提供了一些配置项，都封装在 `workbox.core` API 中，可以稍微了解一下。

**配置缓存名称**

通过 `DevTools -> Applications -> Caches` 可以发现，workbox 对于缓存命名有一些规则的：

```bash
<prefix>-<ID>-<suffix>
```

每个命名都有个前缀和后缀，中间才是真正的命名 ID，主要是为了更大限度的防止重名的情况发生，可以通过以下这种方式分别对 precache 和 runtime 形式的缓存进行自定义命名：

```js
workbox.core.setCacheNameDetails({
    prefix: 'my-app',
    suffix: 'v1',
    precache: 'custom-precache-name',// 不设置的话默认值为 'precache'
    runtime: 'custom-runtime-name' // 不设置的话默认值为 'runtime'
});
```

通过以上设置后，precache 类型的缓存名称为 `my-app-custom-precache-name-<ID>-v1`，runtime 类型的缓存名称为 `my-app-custom-runtime-name-<ID>-v1`。workbox 推荐尽量为你的每个项目设置不同的 prefix，这样你在本地 locahost 调试 Service Worker 的时候可以避免冲突。而 suffix 可以用来控制缓存版本，让站点的 Service Worker 更新机制变得清晰维护。

workbox 为了让 Web App 的缓存管理的更加细粒度的清晰可维护，也提供了策略级别的缓存命名设置，可以通过策略 API 的 `cacheName` 参数进行设置：

```js
workbox.routing.registerRoute(
    /.*\.(?:png|jpg|jpeg|svg|gif)/g,
    new workbox.strategies.CacheFirst({
        cacheName: 'my-image-cache',
    })
);
```

这样，对应的图片相关的 `cacheFirst` 策略的缓存都会以 `my-image-cache-<ID>` 的形式命名，这里要注意的是：**prefix 和 suffix 是不需要设置的**

**指定 development 环境**

workbox 开发过程中是需要 debug 的，所以 workbox 3 也提供了 logger 机制帮助我们排查问题，但是在生产环境下，我们不希望也产生 logger 信息，所以 workbox 提供了「指定当前环境」 的设置：

```js
// 设置为开发模式
workbox.setConfig({debug: true});

// 设置为线上生产模式
workbox.setConfig({debug: false});
```

**配置日志 Level**

workbox 3 提供 logger 机制帮助我们更好的调试 workbox，一共有四种 log level：`debug`，`log`，`warn`，`error`。

<img src="./workbox-core-logs.png" style="border:none;" alt="workbox logs" />

可以通过以下方式设置 log 的 level，这样就可以只看到某个 level 的 log 信息，让调试的过程中更加专注。具体的设置方式是通过 `worbox.core` API 中的 `setLogLevel` 方法来完成：

```js
// 展示所有的 log
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug);

// 只展示 log, warning 和 error 类型的 log
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.log);

// 只展示 warning 和 error 类型的 log
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.warn);

// 只展示 error 类型的 log
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.error);

// 啥 log 都没有，这个适用于线上生产环境
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.silent);
```

## workbox 插件

插件机制应该是 workbox 3 最大的改进了，在 2.x 中，现有的插件大部分功能都是直接以 API 的形式抛给开发者，让开发者一头雾水，现在 3.0 中每个内置插件自己封装了之前的 API，对开发者来说专门解决了一个个独立的问题。除此之外，workbox 3 还提供插件扩展机制以及事件钩子可以让开发者自己扩展插件。workbox 插件可以让你通过操作一个请求的生命周期中的返回内容和请求内容添加其他的一些行为。

workbox 插件通常都是在缓存策略中使用的，可以让开发者的缓存策略更加灵活，workbox 内置了一些插件：

- **workbox.backgroundSync.Plugin**: 如果网络请求失败，就将请求添加到 background sync 队列中，并且在下一个 sync 事件触发之前重新发起请求。

- **workbox.broadcastUpdate.Plugin**: 当 Cache 缓存更新的时候将会广播一个消息给所有客户端，类似于 [sw-register-webpack-plugin](https://github.com/lavas-project/sw-register-webpack-plugin) 做的事情。

- **workbox.cacheableResponse.Plugin**: 让匹配的请求的符合开发者指定的条件的返回结果可以被缓存，可以通过 `status`, `headers` 参数指定一些规则条件。

- **workbox.expiration.Plugin**: 管理 Cache 的数量以及 Cache 的时间长短。

可以像如下方式来使用 workbox 插件，以 `workbox.expiration.Plugin` 为例：

```js
workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg)$/,
    workbox.strategies.cacheFirst({
        cacheName: 'images',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 60, // 最大的缓存数，超过之后则走 LRU 策略清除最老最少使用缓存
                maxAgeSeconds: 30 * 24 * 60 * 60, // 这只最长缓存时间为 30 天
            }),
        ],
    }),
);
```

### 自定义插件

当然，workbox 也知道这些插件肯定不能满足大家的自定义策略的要求，所以索性将整个请求生命周期中的关键事件以事件钩子回调函数的方式暴露出来，也就是说，我们可以使用这些事件钩子打造自己更加灵活的 workbox 插件。一个插件就是一个构造函数，而钩子就是以构造函数的方法的形式供开发者们自定义开发，下面介绍一下有哪些事件钩子：

**cacheWillUpdate**

 `cacheWillUpdate({request, response})`，在请求返回结果替换 Cache 结果之前被调用，你可以在这个事件钩子中在更新缓存之前修改返回的结果，如果将结果直接设为 `null` 来避免当前请求的返回的结果被更新到缓存。

**cacheDidUpdate**

`cacheDidUpdate({cacheName, request, oldResponse, newResponse})`，当有新的缓存写入记录或者 Cache 缓存被更新时被调用，你可以调用这个方法在 Cache 缓存更新之后干点什么。

**cachedResponseWillBeUsed**

`cachedResponseWillBeUsed({cacheName, request, matchOptions, cachedResponse})`，在 Cache 缓存的结果在 fetch 事件中被触发响应返回之前调用，可以使用这个回调来允许或阻止正在使用的 Cache 响应返回。

**requestWillFetch**

`requestWillFetch({request})`，当任何 fetch 事件被触发的时候都会被调用，可以在这个毁掉中修改请求的 request 内容。

**fetchDidFail**

`fetchDidFail({originalRequest, request})`，当 fetch 事件触发失败的时候被调用，fetch 事件触发失败是网络根本无法请求，而不是请求返回为 `非 200` 的状态的时候，可以用这个钩子在检测到断网的时候干点什么。

如果你想写一个自己的 workbox 插件，只需要参照如下方式：

```js
// my-workbox-plugin.js
export default const MyWorkboxPlugin = {
    cacheWillUpdate({request, response}) {
        // ... 搞事情
    },

    // ... 继续搞事情
};
```

本文参考了 [Google 官方文档](https://developers.google.com/web/tools/workbox/guides/get-started)，在文档的基础上做了一些自己的解读和总结，有兴趣的开发者可以阅读原始文档，文档中还列出了一些「**最佳实践**」以及 「**debug**」 的方式，可以帮助我们更好的使用 workbox。
