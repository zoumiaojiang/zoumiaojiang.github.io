title: ServiceWorker可以做些什么
data: 2017/04/18 20:46:25
categories:
- pwa

comments: true

tags:
- serviceWorker
- preformance
- HTML5
---

![network offline](/assets/images/what-can-serviceworker-do/offline.jpg)

service worker简介
===


## 背景：如何让网页的用户体验做到极致

随着web的快速发展，对用户体验要求的越来越严格，我们前端工程师几乎有很大一部分时间在为了几十ms的提升费劲心思。为了错综复杂的互联网环境中让自己的产品在用户体验方面脱颖而出，我们便有了更多的性能方面的要求。而在时间成本高昂今天，尤其是极速体验更值得我们去探索。

之前我们有过很多性能优化的军规，我们做静态资源的合并压缩，我们做 css spriter, 做模块化从而做静态资源的异步加载，做各种静态资源的缓存，搞 cdn 等等等等。其实我们绝大部分情况是在干一件事情，那就是尽量减少一个页面的网络请求成本从而缩短页面加载资源的时间并降低用户可感知的延时。当然减少用户可感知的延时也不仅仅是在网络请求成本层面。还有浏览器渲染效率，代码质量等等。

那么到了今天，如果有人告诉你：“`我们的站点可以秒开，没网络的情况下也能浏览，不是 file:// 协议的哦！`”，你是不是要送他一个大大的问号脸？

![问号脸](https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1493894698909&di=af0d8131b4988261d0769aa4dda47fe9&imgtype=0&src=http%3A%2F%2Fi10.hoopchina.com.cn%2Fhupuapp%2Fbbs%2F600%2F19471600%2Fthread_19471600_20161010154103_s_117261_o_1617512482.png)

我们这里要讲到的是一个叫做service worker的东东。


## 什么是service worker?

W3C组织早在2014年5月就提出过 service worker 这样的一个 HTML5 api ，主要用来做持久的离线缓存。
（todo: servcie worker工作流程图）

当然这个api不是凭空而来，至于其中的由来我们可以简单的捋一捋：

浏览器中的 javaScript 都是运行在一个单一主线程上的，在同一时间内只能做一件事情。随着 web 业务不断激增，我们逐渐在 js 中有了很多耗资源、耗时间的复杂运算过程，然而这个过程导致的性能问题在 web app 的复杂化过程中更加凸显出来。

W3C 组织早早的洞察到了这些问题可能会造成的影响，这个时候有个叫 webworker 的 api 被造出来了，这个 api 的唯一目的就是解放主线程，webworker 是脱离在主线程之外的，将一些复杂的耗时的活交给它干，完成后通过 postMessage 方法告诉主线程，而主线程通过 onMessage 方法得到webworker的结果反馈。

一切问题好像是解决了，但 webworker 是临时的，我们能不能有一个东东是一直持久存在的，并且随时准备接受主线程的命令呢？这样的需求才推出了最初版本的 service worker ，service worker 在 webworker 的基础上加上了持久离线缓存能力。当然在service worker之前也有做离线缓存的东东叫 appCache, 然而 appCache 是存在很多 [不能忍受的缺点](https://alistapart.com/article/application-cache-is-a-douchebag)。

ok ，那么 service worker 是具体用来干啥的呢？

service worker有以下功能特性：

- 就是一个独立 worker 线程，独立于当前网页进程

- 一旦被 install 之后，就永远存在，除非被 uninstall

- 需要的时候可以直接唤醒，不需要的时候自动睡眠（有效利用资源，此处有坑）

- 可以可编程截取代理请求( https 请求)和返回，缓存文件，缓存的文件直接可以被网页进程取到（包括网络离线状态）

- 离线内容开发者可控

- 能向客户端推送消息

- 不能直接操作 dom

- 出于安全的考虑，必须在 https 环境下才能工作

- 异步实现，内部大都是通过 Promise 实现


## 浏览器支持情况

虽说 W3C 组织为了让用户体验做到极致操碎了心提出了这么有用的 api ，我们都知道根据以往标准或草案的提出各大浏览器厂商的实现步伐是不一样的，那么 serviceWoker 这么好用的东西到底浏览器支持情况怎么样呢？

(todo: 浏览器兼容图)

看到这张图还是相当激动的，至少也绿了一片，总结一下：

- chrome作为先锋早早的就在v40版本就支持了，还提供了完善的debug方案（ debug 后面讲）

- firefox，opera不甘示弱在后续版本也进行了支持

- 安卓手机 4.x 以上版本新系统形势一片大好（具体各手机的实现还得进一步探测）

- 安卓chrome同样给力

- iOS。。

- IE。。

这里说明一下，由于 apple 的个性突出，iOS内的所有的浏览器其实都是用safari的核，也就是说如果 iOS safari 不支持，iOS 所有浏览器就都不支持了，当然 apple 官方在2015年暗示过，service worker 的支持在他们的 [5年计划内](https://trac.webkit.org/wiki/FiveYearPlanFall2015)，不揣测任何原因，我们就翘首以盼就好了，掐指一算一统江湖的好日子应该就这几年的事情了。

[微软表态了](https://developer.microsoft.com/en-us/microsoft-edge/platform/status/serviceworker/)：IE是来不及支持 service worker 了，但是目前 Microsoft Edge 的支持情况是`in Development in Microsoft Edge on Desktop, Mixed Reality, Mobile and Xbox`

现在最新的实现情况是这个样子的：

（todo: 浏览器最新支持情况）

如果想了解更多，[这里](https://jakearchibald.github.io/isserviceworkerready) 有更详细的最新浏览器支持情况。




## service worker 如何工作

说了这么多，我们已经知道 service worker 是干嘛的了，但是它具体是怎么运作起来的呢？

通常我们如果要使用 service worker 基本是以下几个步骤：

- 首先我们需要在页面的 javaScript 主线程中使用 `serviceWorkerContainer.register()` 来注册 servcie worker ，在注册的过程中，浏览器会在后台启动 service worker 的安装步骤。

- 开始安装步骤， 通常在安装的过程中需要缓存一些静态资源。如果所有的资源成功缓存则安装成功，如果有任何静态资源缓存失败则安装失败，在这里失败的不要紧，会自动继续安装直到安装成功，如果安装不成功无法进行下一步 — 激活 service worker。

- 开始激活 service worker，必须要在 service worker 安装成功之后，才能开始激活步骤，当service worker 安装完成后，会接收到一个激活事件(activate event)。激活事件的处理函数中，主要操作是清理旧版本的 service worker 脚本中使用资源。

- 激活成功后service worker 可以控制页面了，但是只针对在成功注册了service worker 后打开的页面。也就是说，页面打开时有没有service worker，决定了接下来页面的生命周期内受不受service worker 控制。所以，只有当页面刷新后，之前不受 service worker 控制的页面才有可能被控制起来。




## service worker 生命周期

![service worker生命周期](https://developers.google.com/web/fundamentals/getting-started/primers/imgs/sw-lifecycle.png?hl=zh-cn)

## service worker 具体用法

### 前提条件

由于 service worker 要求 https 的环境，我们通常可以借助于 [github page](https://pages.github.com) 进行学习调试。当然localhost也是ok的

当前各浏览器对 service worker API 支持情况不同，我们需要在注册之前做好探测降级处理

```javascript
if (navigator.serviceWoker) {
    // 支持 service worker , 可以继续注册 service worker
}
else {
    // 正常的业务逻辑
}
```

### 安装

### 激活

### 缓存和请求返回

### 更新service worker

### 


## service worker debug


