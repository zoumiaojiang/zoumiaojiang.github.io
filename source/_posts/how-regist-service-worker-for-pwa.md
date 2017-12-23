---
title: "如何优雅的为 PWA 注册 Service Worker"
catalog: true
date: 2017-07-30 15:51:24
subtitle: ""
header-img: "service-worker.png"
tags:
- PWA
- Service Worker
- Lavas
categories:
- PWA
---

这是一篇技术文，在开始阅读这篇文章之前，先了解以下内容更能加深您的理解：

- [PWA](https://lavas.baidu.com/doc)
- [Service worker 的工作原理](https://lavas.baidu.com/doc/offline-and-cache-loading/service-worker/service-worker-introduction)

这篇文章主要探讨的是如何让 PWA 优雅合理的注册一个 Service Worker，从而让站点拥有 Service Worker 所提供的能力，如果看到标题的第一想法是 “Service Worker 注册一个这么简单的话题有啥可讲的”，看到后面可以发现还是有一些坑的。本文少图较长，慎读。

通过对 PWA 文档的学习和理解，我们应该都知道了 PWA (Progressive Web Apps) 不是一项技术，不是一个框架，如果我们非要说 PWA 是个什么，可以把她理解为一种模式，一种通过应用一些技术将 Web App 在安全、性能和体验等方面带来渐进式的提升的一种 Web App 模式。如果对 PWA 进行一个简单粗粒度的拆解的话，她主要包含三个方面：

- 可靠 - 即使在不稳定的网络环境下，也能瞬间加载并展现
- 体验 - 快速响应，并且有平滑的动画响应用户的操作
- 粘性 - 像设备上的原生应用，具有沉浸式的用户体验，用户可以添加到桌面

作为一个开发者，也许更关心是通过怎样的技术来怎么实现这三个方向的功能特性。通过前面的 Service Worker 文档链接学习，大家应该知道 Service Worker 具有离线缓存（Offline Cache），消息推送（Notification Push），后端同步（Background sync）的能力。在弱网环境下快速加载，Service Worker 的离线缓存功能功不可没，以及在其他体验优化和提升用户粘性方面 Service Worker 都发挥着重要的作用。

## Service Worker 文件

您可能已经了解了 Service Worker，但是这里还是有必要再简单的探讨一下什么是 Service Worker，对于浏览器来说，Service Worker 是一个独立于 js 主线程的一种 Web Worker 线程，一个独立于主线程的 Context，但是面向开发者来说 Service Worker 的形态其实就是一个需要开发者自己维护的文件，我们假设这个文件叫做 `sw.js`，此文件的内容就是定制 Service Worker 生命周期中每个阶段所处理的定制化的细节逻辑，比如缓存 Cache 的读写，更新的策略，推送的策略等等，通常 `sw.js` 文件是处于项目的根目录，并且需要保证能直接通过 `https://yourhost/sw.js` 这种形式直接被访问到才行。

当然，如果快速写一个 `sw.js` 用来注册玩一下而已还是蛮简单的，基本就是如下的套路（代码为示意代码）：

```js
// sw.js 文件

// 安装
self.addEventListener('install', function (e) {
    // 缓存 App Shell 等关键静态资源和 html (保证能缓存的内容能在离线状态跑起来)
});

// 激活
self.addEventListener('activate', function (e) {
    // 激活的状态，这里就做一做老的缓存的清理工作
});

// 缓存请求和返回（这是个简单的缓存优先的例子）
self.addEventLisener('fetch', function (e) {
    e.respondWith(caches.match(e.request)
        .then(function (response) {
            if (response) {
                return response;
            }
            // fetchAndCache 方法并不存在，需要自己定义，这里只是示意代码
            return fetchAndCache(e.request);
        })
    );
});
```

通常开发者都不太愿意从无到有去自己写一个 `sw.js` 的，一般都会选择使用工具来辅助生成一个相对复杂和完善的 Service Worker 文件，例如 [sw-precache](https://github.com/GoogleChrome/sw-precache) + [sw-toolbox](https://github.com/GoogleChrome/sw-toolbox) 组合的方式，这样的话就省去了其中的很多缓存策略的细节考虑以及细节逻辑处理问题。当然，Service Worker 文件如何生成不是我们今天所要讲的重点话题。假设在正式开始我们今天的主题之前已经生成好了一份 `sw.js` 文件了，接下来就深入的探讨一下如何优雅的去注册一个已经生成好的 `sw.js`。

## 快速注册 Service Worker

注册 Service Worker 还是蛮简单的，只要小段代码。只要在工程中的 html 文档的 `<script>` 里或者随便在页面的哪个 javaScript 模块中加如下这行代码就搞定了，

```js
// 只要保证 https://yourhost/sw.js 可访问就行
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js');
}
```

因为 Service Worker 的载入是完全异步的（Chrome DevTools 中 Network 的 XHR 中可以找到），注册的时候不用担心 block 的问题。

理想很丰满，现实太骨感，生产环境下的 Web App 开发中如果真是这么简单的话就好了，那在这里就没必要来写这篇文章。这句代码的确能注册 Service Worker，但是 Service Worker 注册这个看似简单的工作远比我们想象的要复杂。接下来一点一点的来深入。

## HTTPS 环境

HTTPS 是 Service Worker 所必须依赖的应用层协议，Service Worker 只有在 Web App 为 HTTPS 的环境下才能被注册成功，可是我们开发的时候应该不会直接在线上开发，拥有一个 HTTPS 的测试环境成本很高。

各大浏览器厂商也考虑到了这个问题，如 Chrome，Firefox，在 `localhost` 和 `127.0.0.1` 的 host 下，也能注册成功。这样就能保证我们在本地开发的时候也能直接注册。

对于很多开发者来说，大部分情况是有自己的开发环境的机器，但是没有配置 HTTPS，可以通过改 host 的方式来将远程的 IP 对应到 `localhost` 的域就可以了，这样既能保证访问到的是真实的开发环境，并且不用费很大劲去弄 HTTPS 环境的把 Service Worker 给注册了。

```bash
# /private/etc/hosts 或 /windows/system32/drivers/etc/hosts
# 开发环境 IP 为 12.23.34.45

12.23.34.45  localhost
```

对于远程开发环境还可以通过本地服务器（nginx 或 apache 等）代理的方式去做，在这里就不做深入的探讨。

## Service Worker 作用域

通常情况下，在注册 `sw.js` 的时候会忽略 Service Worker 作用域的问题，Service Worker 默认的作用域就是注册时候的 path, 例如 Service Worker 注册的 path 为 `/a/b/sw.js`，则 scope 默认为 `/a/b/`。

```js
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/a/b/sw.js').then(function (reg) {
        console.log(reg.scope);
        // scope => https://yourhost/a/b/
    });
}
```

当然也可以通过在注册时候传入 `{scope: '/some/scope/'}` 参数的方式自己指定 scope ，但是自己指定 scope 也是有一定的限制的，其中也隐藏着一些坑。

当合理的指定 scope 的情况下：

```js
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/a/b/sw.js', {scope: '/a/b/c/'})
        .then(function (reg) {
            console.log(reg.scope);
            // scope => https://yourhost/a/b/c/
        });
}
```

但是也存在指定错误的 scope 的情况：

```js
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/a/b/sw.js', {scope: '/a/'})
        .then(function (reg) {
            console.log(reg.scope);
            // Ops !!!，报错啦！！
        });
}
```

![scope 报错信息](https://user-images.githubusercontent.com/3365978/28677362-e64ae220-731f-11e7-9068-de31ca390211.png)

通过报错信息，可以知道 `sw.js` 文件是在 `/a/b/` path 下才能被访问到，则默认的 scope 和最大的 scope 都是 `/a/b/` 通俗的讲：Service Worker 最多只能在这个 path 范围内发挥作用，以代码为例，`/a/b/`，`/a/b/c/`，`/a/b/c/d/` 下的页面都可以被注册的 Service Worker 控制，但是 `/a/`，`/e/f/` 下面的页面是不受注册的 Service Worker 的控制的（当然浏览器也会抛出错误告知开发者）。

也就是说，在最大 scope 的基础上才能指定自定义的 scope， 例如 `/a/b/c/` 。

> 值得注意的是：
>
> 类似于 Ajax 的跨域请求可以通过对请求的 `Access-Control-Allow-Origin` 设置，我们也可以通过服务器对 `sw.js` 这个文件的请求头进行设置，就能够突破 scope 的限制，只需要设置 `Service-Worker-Allowed` 为更大控制范围或者其他控制范围的 scope 即可。
>

通过对 Service Woker 作用域的了解，也许会发现这么样的一个问题：

假设在 `https://yourhost` 域下有 A 页面 (`https://yourhost/a`) 和 B 页面（`https://yourhost/b`）。

假设 A 页面在 `/a/` 作用域下注册了一个 Service Worker，B 页面在 `/` 作用域下注册了一个 Service Worker，这种情况下 B 页面的 Service Worker 就可以控制 A 页面，因为 B 页面的作用域是包含 A 页面的最大作用域的（我们可以把这种情况称之为 `作用域污染`）。在开发环境开发者还可以通过 DevTools 进行手动 unregister 来清除掉污染的 Service Worker，但是如果用户在手机端被安装了 Service Worker 之后可以理解这就是个持久的过程。除非用户手动清除存储的缓存（这个也是不可能的），否则对用户来说就是个持久污染的噩梦。

当然，出现作用域污染的情况也不是没有办法补救的，比较合理的一种做法是，在新上线的版本中注册 Service Worker 之前将污染的 Service Worker 注销掉。

```js
if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(function (regs) {
        for (var reg of regs) {
            if (reg.scope === 'https://yourhost/') {
                reg.unregister();
            }
        }
        // 注销掉污染 Service Worker 之后再重新注册自己作用域的 Service Worker
        navigator.serviceWorker.register('/a/sw.js').then(function (reg) {
            // ...
        });
    });
}
```

对于一个拥有多个平行子站的大型站点，作用域污染的情况很有可能因为缺乏沟通或者滥用 Service Worker 而发生。

## SPA 注册 Service Worker

SPA（Single Page Applications），单页 Web 应用，在工程架构上只有一个 `index.html` 的入口，站点的内容都是异步请求数据之后在前端渲染的，应用中的页面切换都是在前端路由控制的。

通常会将这个 `index.html` 部署到 `https://yourhost`，对于 SPA 的 Service Worker，只会在 `index.html` 中注册一次，所以我们会将 `sw.js` 直接放在站点的根目录保证可访问，Service Worker 的 scope 通常就是 `/`，这样能够控制整个 SPA 的缓存。

SPA 每次路由的切换都是前端渲染的过程，本质上还是在 `index.html` 上的前端交互，通常 Service Worker 会缓存 SPA 中的 AppShell 所需的静态资源和 `index.html`。当然有一种情况比较特殊，当用户从 `/a` 页面切换到 `/b` 页面，然后这时候刷新页面，此时首先渲染的还是 `index.html`，在执行 SPA 的路由逻辑之后，通过 SPA 前端路由的处理继续在前端渲染相应的路由对应的 Component。

## MPA 注册 Service Worker

MPA（multi page applications），多页应用，这种架构的模式在现如今的大型站点非常常见，例如 [ele.me](https://m.ele.me) 就是采用这种模式来架构的站点，这种站点有常规的 Web App 的特性，但是相比较 SPA 能够承受更重的业务体量，并且利于大型站点的后期维护和扩展。针对 MPA 的 PWA 可以阅读 [饿了么的 PWA 升级实践](https://zhuanlan.zhihu.com/p/27853228) 进行更加深入了解。

在这里我们可以更加深入的了解一下 MPA PWA 是如何注册 `sw.js` 的，MPA 可以理解为是有多个 html 文件对应着多个不同的服务端路由，也就是说 `https://yourhost/a` 映射到 `a.html`, `https://yourhost/b` 映射到 `b.html` 等等。

那么这种架构下怎么去注册 Service Worker 呢？是不同的页面注册不同的 Service Worker，还是所有的页面都注册同一个 Service Worker？结论是：需要根据实际情况来定。

### 注册单个 Service Worker

在每个页面之间的业务相似度较高，或者每个页面之间的公共静态资源或异步请求较多，这种 MPA 是非常适合在所有的页面只注册一个 Service Worker。

例如 `https://yourhost/a` 和 `htps://yourhost/b` 之间的公共内容较多，则通常情况下在 `/` 作用域下注册一个 Service Worker。这样这个 Service Worker 能够控制 `https://yourhost` 域下的所有页面。

维护单个 Service Worker 有如下特点：

- 可以统一管理整个站点的缓存。
- 不会造成页面之间的作用域污染。
- 后期维护成本相对较低。

### 注册多个 Service Worker

适用于主站非常庞大，并且是以 path 分隔的形式铺展垂类子站的大型站点（现在这种毕竟少了，基本都用二级域名区分子站），这种情况下不适合只在跟作用域下注册一个 Service Worker。

例如，`https://yourhost/a` 和 `https://yourhost/b` 几乎是两个站点，其中公共使用的静态资源或异步请求非常少，则比较适合每个子站注册维护自己的 Service Worker，`https://yourhost/a` 注册 Servcie Worker 的作用域为 `/a/`，最好是存在 `/a/sw.js` 可访问，尽量不要使用某一个公用的 `/sw.js` 然后使用 `scope` 参数来自定义作用域。这样会增加后期的维护成本以及增加出现 bug 的几率。

子站在实现上还要考虑一点是，防止主站 `https://yourhost` 的 Service Worker 对自身造成污染，需要在注册子站 Service Worker 之前将主站的 Service Worker 注销掉（这个方法也不是很好，相当于剥夺了主站 Service Worker 的权利）。

注册多个 Service Worker 有如下特点：

- 需要严格要求每个子站管理好自己的 `sw.js` 以及 scope。
- 防止对其他子站的 Service Worker 造成影响。
- 相比较整个站点只注册一个 Service Worker，这种维护多个 Service Worker 的方式更加灵活。
- 风险相对会更加大，也更加难以维护。

## Service Worker 更新

Service Worker 的更新也会影响到 Service Worker 的注册，在这里，重点剖析一下 Service Worker 更新的问题。

当页面注册好了一个 Service Worker 之后，Service Worker 会被安装、激活、通过 `fetch` 事件监听作用域下站点的网络请求等等行为，为了 Web App 的首屏体验，[AppShell](https://lavas.baidu.com/doc/architecture/the-app-shell-model) 作为最小优先展现单元，其中的html 页面和静态资源是需要被持久缓存起来的。也就是说保证用户能在离线之后至少优先看到一个完整的 AppShell。

这个和优雅的注册 Service Worker 有个啥子关系？

拿 SPA 为例，作为 AppShell 的载体 `index.html` 是会被缓存起来的，AppShell 的静态资源也都会被缓存起来的，然而 Service Worker 的注册必然是需要在 `index.html` 的 `<script></script>` 标签或者被缓存住的 js 文件中做的。

如果 `sw.js` 发生了更新，我们预期的是希望浏览器立即更新当前页面的缓存，并且立即加载最新的内容和资源。`sw.js` 的更新包含她 URL 的更新和内容的更新，Service Worker 本身的机制能够 diff 到 `sw.js` 的更新，如果在注册时候通过 [Service Worker Update 算法](https://w3c.github.io/ServiceWorker/#update-algorithm) diff 到 URL 或者 内容的更新，则马上启动新的 `sw.js` 文件的安装、激活，但因为用户当前的页面已经使用老的缓存中的内容加载完成，所以需要等到第二次进入页面的时候才能真正使用新的静态资源和网络请求。

这个机制是有以下两个坑的：

- `sw.js` 自身也会被浏览器缓存（也就是 diff 不能做到实时）
- 就算 diff 到了最新的 `sw.js`，用户在当前的这次访问中的任何交互还是使用老的缓存内容，需要等到第二次进入页面才能更新缓存

对于 `sw.js` HTTP 缓存的问题解决方案肯定是让这个文件永远都不缓存（暂时不讨论请求开销的问题）

## Service Worker 文件 no-cache 处理

为了能让 Service Worker 做到实时更新，必须要解决 Service Worker 文件 `sw.js` HTTP 缓存的问题。
通常需要让文件完全无缓存，有两种思路：一种是在服务器端控制请求文件的 `Cache-Control`，另一种就是在前端通过版本号来改变浏览器缓存策略。

### 服务器 Cache-Control

服务器端的 Cache-Control 的控制是将 `sw.js` 的请求设置成 `no-cache`，以 nginx 为例：

```nginx
location ~ \/sw\.js$ {
    add_header Cache-Control no-store;
    add_header Pragma no-cache;
}
```

通过配置服务器这种方式的**好处**是：只要做好了 `sw.js` 缓存实时更新问题之后，就可以不用关心整个 Web App 的实时更新问题，浏览器都会参照 「`sw.js` 的 diff」 -> 「重新安装新 `sw.js`」 -> 「激活并删除老的缓存」 ->「用户第二次进入页面重新更新缓存」的套路来自行搞定。

当然，这种处理方式也有很大的局限性，如果您将静态资源都部署在第三方的 CDN 静态资源服务器，单独针对某一个文件进行服务器设置 `sw.js` 还是感觉很麻烦。尤其是对于大型站点的运维人员来说，在服务器新增一个路由不是一件很随意的事情。

### 前端版本控制

对于前端版本控制，前端开发者应该并不陌生，如果需要一个静态资源的请求永远不会被缓存，下面这种做法就很好理解了

```js
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js?v=' + Date.now());
}
```

这段代码一祭出，就解决了之前所提到的 `sw.js` 被浏览器缓存的问题了。

但是，这种做法又引发出了其他的问题，每次执行注册 Service Worker 代码逻辑的时候，Service Worker 都能 diff 到变化（URL 的变化也是一种更新的 diff），每次都会在第一次安装，第二次激活并且更新缓存，这种做法使得 Service Worker 的缓存完全没有生效，和每次都和请求最新的 Network 请求内容没什么区别，理论上讲，这种方式由于缓存的频繁读取和删除，甚至比每次直接无缓存刷新的性能更加糟糕。

> 在这里也需要提醒大家注意
> 
> 在 Service Worker 得注册过程中，慎用时间戳来做版本控制，会导致一些意想不到的坑。事实也证明这种做法也是不可取的。

接下来转变一下思路，这个时候需要先想一想如何优雅的做好无缓存的版本控制了。如果不能对 `sw.js` 直接做版本控制，能不能对别的文件做无缓存的版本控制，然后在这个文件中再执行 Service Worker 的注册逻辑？

假设这个文件叫 `sw-register.js`，其代码如下：

```js
// sw-register.js
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
        // ...
    });
}
```

然后在 `index.html` 中对 `sw-register.js` 做版本控制就好了：

```html
<script>
    window.onload = function () {
        var script = document.createElement('script');
        var firstScript = document.getElementsByTagName('script')[0];
        script.type = 'text/javascript';
        script.async = true;
        script.src = '/sw-register.js?v=' + Date.now();
        firstScript.parentNode.insertBefore(script, firstScript);
    };
</script>
```

这样处理之后，`sw-register.js` 就不会被浏览器缓存了，并且由于 `sw-register.js` 是异步加载的，也不会造成页面 block，但还有个问题，当前的 `sw.js` 依然会被浏览器 HTTP 缓存。根本问题还是没有解决。

其实设想一下，每次 Service Worker 的更新都是因为工程的上线，如果能够保证每次上线一次就赋给 `sw.js` 一个版本，等新上线之后就用新的版本号替换老的版本号，从而触发 Service Worker 的 diff，并且能保证每次上线之后就更新了新的 `sw.js`。

```js
// sw-register.js
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js?v=buildVersion').then(function (reg) {
        // ...
    });
}
```

其中 `buildVersion` 是每次上线前构建的一个唯一版本号。

这样看来，是解决了之前 Service Worker 更新不及时的问题。但是代价是增加了一次 `sw-register.js` 的请求，由于 `sw-register.js` 通常只做 Service Worker 的注册工作，体量不会太大，所以应该还是可以接受，相比于在服务器端的配置，前端的版本控制的方案应该更加的简单方便。

### 为什么不直接使用 buildTime 做版本控制？

绕了一圈，版本控制为什么不直接在 注册 `sw.js` 时候做，为什么非要借助一个 `sw-register.js` 文件？就像如下代码：

```js
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js?v=buildTime').then(function () {});
}
```

为了保证离线可用，所有和 AppShell 相关的 html 和静态资源都要被缓存住，此时，就算上线时候更改了 `buildTime`, 但是 Service Worker 所有可能被注册的地方由于被缓存了是感知不到变化的，除非是用 `Date.now()` 这种变量时间戳的方式自动轮询，但是这种方案的弊端在前面已经分析过了。


## Service Worker 缓存实时生效

Service Worker 是一个独立于浏览器主线程的 Worker 线程，在这个线程 Context 中是不允许操作页面的 DOM，但是 Worker 线程可以通过 postMessage 机制与主线程进行通信。

通过前面对 Service Worker 的介绍，已经了解到 Service Worker 更新的第二个痛点是必须要等到用户第二次进入页面的时候才能使用 Service Worker 更新之后的内容，我们的预期是如果 Web App 重新上线了，那用户在任何时候打开页面都能使用到最新的内容，并且同时还要保持 Service Worker 离线缓存的特性。

通过对 `sw.js` 文件的无缓存处理，我们能做到实时的检测更新，接下来需要处理缓存更新实时生效的问题。

当注册 Service Worker 得时候，实时监测到 `sw.js` 更新之后，则浏览器会立即立即安装、激活，然而激活完成并清除老的缓存之后，如果有一种途径告诉主线程 `sw 完成了更新` 这样也会对用户比较友好。

```js
// sw.js 文件

// 新的 Service Worker 更新时，进入激活状态后，会触发 activate 事件
self.addEventListener('activate', function (event) {
    var cacheName = 'a_cache_name';
    event.waitUntil(
        caches.open(cacheName)
            .then(function (cache) {
                // 进行老缓存的清除...(略过..)
            })
            .then(function () {
                // 完成缓存删除之后就可以通知浏览器主线程啦
                // 当然这里也可以判断如果缓存内本来就没内容
                // 就代表是首次安装，就不要发 message了 (这个逻辑略过...)
                return self.clients.matchAll()
                    .then(function (clients) {
                        if (clients && clients.length) {
                            clients.forEach(function (client) {
                                // 给每个已经打开的标签都 postMessage
                                client.postMessage('sw.update');
                            })
                        }
                    })
            })
    );
})
```

这样的话，相当于我们在自己的业务代码中只要监听 `message` 事件，监听到 `sw.update` 这个 message 就知道 Service Worker 更新成功了。看来这段代码写在 `sw-register.js` 中比较优雅，我们可以把 `sw-register.js` 这个文件就当成专门处理 Service Worker 的文件好了。

```js
// sw-register.js

if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', function (e) {
        if (e.data === 'sw.update') {
            // 如果代码走到了在这里，就知道了，Service Worker 已经更新完成了
            // 可以做点什么事情让用户体验更好
        }
    });
}
```

### Service Worker 实时生效的策略

通常对用户比较友好的实时生效策略有两种：

- 监听到 Service Worker 成功更新后，直接 `location.reload()` 刷新当前页面
- 通过 toast 的形式提示用户主动刷新当前页面

目前百度 [Lavas](https://lavas.baidu.com) 解决方案推荐的是第二种引导用户刷新的方式，[Filpkart Lite（墙外）](https://www.flipkart.com/) 也是使用引导用户的方式，当然随意添加 toast 可能会引起产品点击率等方面的影响，具体使用哪种策略当然是由产品设计师决定。我们在这里讲的是使用技术手段建立的这套机制。

![lavas Service Worker 更新完成提示](https://user-images.githubusercontent.com/3365978/28677486-2ed23d68-7320-11e7-8aad-8346e5134e90.png)

## sw-register-webpack-plugin

无论是 Service Worker 作用域问题，还是 Service Worker 的更新问题，都与 Service Worker 的注册息息相关，一个看似简单的 Service Worker 的注册还是有很多地方需要注意，但是如果这些都需要在每个项目中都要自己完全实现一遍，还是非常繁琐的。而 [sw-register-webpack-plugin](https://github.com/lavas-project/sw-register-webpack-plugin) 作为一个 Webpack Plugin 很好的帮助我们解决了 **优雅的注册 Service Worker 的问题**

- 如果项目是基于 Webpack 开发的
- 如果不希望自己考虑繁琐的 Service Worker 问题
- 无论是 SPA 还是 MPA

基于以上的考虑，都可以尝试一下 sw-register-webpack-plugin

### 安装

在项目中引入 sw-register-webpack-plugin

```bash
npm install --save-dev sw-register-webpack-plugin
```

### 使用

配置 Webpack 的配置

```js
var SwRegisterWebpackPlugin = require('sw-register-webpack-plugin');

webpack({
    // ...
    plugins: [
        // ... some plugins
        new SwRegisterWebpackPlugin({ /* options */})
        // ... some plugins
    ]
    // ...
})
```

参数介绍详见 [sw-register-webpack-plugin 在 github 中的介绍](https://github.com/lavas-project/sw-register-webpack-plugin/blob/master/README.md)

> PS: 硬广
>
> 百度 Lavas 解决方案中关于 Service Worker 的解决方案采用的就是 sw-register-webpack-plugin
>
> 关于 `sw.js` 文件生成 Lavas 各个模版中采用的是 sw-precache-webpack-plugin 插件，底层使用的是 sw-precache + sw-toolbox 解决方案，Lavas 生成的 `sw.js` 在更新完成后会通过 `postMessage` 发送 `sw.update` 的消息。
>