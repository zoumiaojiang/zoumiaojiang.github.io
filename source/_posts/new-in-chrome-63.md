---
title: Chrome 63 的新鲜货
catalog: true
header-img: ../new-in-chrome-61/chrome.jpg
tags:
  - Chrome
categories:
  - Chrome
date: 2017-12-13 00:20:00
subtitle:
---


2017 年 12 月初，Google Chrome 团队发布了 Chrome 63 版本，在这个版本中又有很多令人兴奋的新特性以及 DevTools 也有很多好用的升级，今天在这里接着介绍一下 Chrome 63 版本有哪些新鲜货。

## 新特性

Chrome 63 此次新增了以下新特性:

- 动态 import JavaScript 模块
- 支持 async 迭代器和 generator 函数
- 支持 overscroll-behavior CSS 属性
- 获取用户许可的 UI 界面变更

### 支持动态引入 JavaScript 模块

从 Chrome 61 版本开始，支持了原生的 import JavaScript 模块，有兴趣的可以查看 [Chrome 61 新鲜货](../new-in-chrome-61)，在 Chrome 63 版本中，解决了在 runtime 不能动态选择合适 JS 模块去 import，为了进一步解决真实开发中问题，Chrome 此次新版本不遗余力的支持了动态 import JavaScript 的特性。

在 Chrome 63+ 的版本中，可以直接运行以下的 JS 代码：

```js
button.addEventListener('click', event => {
    import('./dialogBox.js')
    .then(dialogBox => {
        dialogBox.open();
    })
    .catch(error => {
        /* Error handling */
    });
});
```

也许各大浏览器走上大同的日子还相当遥远，通过这个动态 import JS 原生支持的特性来看，我们可以预见不久的将来是少会发生如下事情：

- 我们的 Web App 首屏速度可以直接原生优化的很完美，首屏页面只需要加载一个很小的 JS 入口模块。
- 模块按需加载可以在浏览器原生解决
- 前端构建工具应该不会像现在这么任务繁重吧
- 配合上 HTTP/2 和 Service Worker 对这些模块静态资源的缓存机制，简直不可想像以后的 Web App 有多强大。

### 支持 async 迭代器和 generator 函数

Chrome 63 版本最新支持了 async 迭代，如下代码所示：

```js
async function example() {
    const arrayOfFetchPromises = [
        fetch('1.txt'),
        fetch('2.txt'),
        fetch('3.txt')
    ];

    // 常规的迭代
    for (const item of arrayOfFetchPromises) {
        console.log(item); // Promise 对象
    }

    // async 迭代
    for await (const item of arrayOfFetchPromises) {
        console.log(item); // 直接打印出结果
    }
}
```

就像可以使用 generator 函数构建常规的迭代器一样，你也可以用 generator 构建 async 迭代器，可以看一下下面这个简单的判断随机数的例子:

```js
async function* asyncRandomNumbers() {
    // 这是一个返回随机数的一个远程服务
    const url = 'https://www.random.org/decimal-fractions/?num=1&dec=10&col=1&format=plain&rnd=new';

    while (true) {
        const response = await fetch(url);
        const text = await response.text();
        yield Number(text);
    }
}

// 调用 async 迭代
async function example() {
    for await (const number of asyncRandomNumbers()) {
        console.log(number);
        if (number > 0.95) break;
    }
}
```

太酷了，有了 async 迭代的功能支持，代码看着都要舒服好多，强迫症重度患者必须要用起来。

### 支持 overscroll-behavior CSS 属性

Chrome 63 版本开始，可以用 `overscroll-behavior` CSS 属性来控制滚动的一些行为，在这个版本中新增这个特性主要是有个背景：

Twitter 在进行 PWA 开发的时候遇到一个关于下拉刷新的问题: 本来设计的是只想下拉异步刷新页面，这样用户体验很好而且减少网络请求：

<video autoplay="" loop="" muted="" style="width: 100%;display:block;max-width:360px;margin: 0 auto; border: 1px solid #ccc;">
    <source src="./twitter.mp4" type="video/mp4">
</video>

可是在 Chrome `添加到桌面之后` 却是这样默认的同步刷新，这显然交互体验比较糟糕：

<video autoplay="" loop="" muted="" style="width: 100%;display:block;max-width:360px;margin: 0 auto;border: 1px solid #ccc;">
    <source src="./mobilep2r.mp4" type="video/mp4">
</video>

在我的另一篇文章 [聊一聊 Andorid Chrome 的下拉刷新](../pull-to-refresh-in-chrome-for-android) 中介绍过 Chrome 的下拉刷新的机制以及相关滚动边界的控制，也介绍了如何禁用 Chrome 的下拉刷新的几种 hack 的方式，有兴趣的同学可以先了解一下。

在 Chrome 63 版本新增 `overscroll-behavior` CSS 属性之前，我们只能很艰难的使用 hack 的方式来避开浏览器默认的下拉交互的各种行为，现在在新版的 Chrome 浏览器中，再也不用为这些事情烦恼了。最重要的是 Chrome 63 版本在设计这个属性的时候考虑到了性能问题，不会对页面本身的性能造成任何负向的影响。值得高兴的是其他浏览器厂商也在考虑实现 `overscroll-behavior` CSS 属性，可以查看 [chromestatus.com](https://www.chromestatus.com/feature/5734614437986304) 了解更多详情。

> `overscroll-behavior` 和 `overflow` 属性在用法上比较像，分别支持 `overscroll-behavior-x` 和 `overscroll-behavior-y` 属性，具体用法可以参照 [Chrome 官方博客](https://developers.google.com/web/updates/2017/11/overscroll-behavior#disableglow)

`overscroll-behavior` 可不仅仅是用来做禁止下拉刷新的，它可以帮助你做包括但不限以下这些事情：

- 禁用 scroll 事件链
- 禁用或者重新定义默认的下拉刷新交互
- 禁用 [Android 滚动过界闪烁效果](../pull-to-refresh-in-chrome-for-android/#-3) 或者 iOS 橡皮弹性效果（与 Android 滚动过届闪烁效果原理一样）
- 可以实现 Swiper 组建的导航功能(垂直或者水平都妥妥的)
- 只要脑洞大，还有更多好玩的功能等你发现。。

#### overscroll-behavior 属性值

`overscroll-behavior` 一共有三个属性值：

- **auto**: 默认的属性值，滚动事件源所在的元素继承祖先元素的属性值。
- **contain**: 阻止滚动事件链，滚动事件不会往祖先元素冒泡，但是自身的 scorll 事件不受影响。
- **none**: 和 contain 一样，但是也会阻止自身元素的 Scroll 事件。（比如阻止 Android 滚动便捷闪烁效果或者 iOS 橡皮弹性效果）

#### overscroll-behavior 例子

**禁止下拉刷新**

```css
body {
  /* 这会禁止下拉刷新，但是不会禁止滚动过界闪烁 */
  overscroll-behavior-y: contain;
}
```

**禁止 Android 滚动过界闪烁或者 iOS 橡皮弹性效果**

```css
body {
  overscroll-behavior-y: none;
}
```

这里有一个 Chrome 开发人员提供的完整的 `overscroll-behavior` 实例 [DEMO](../../demo/chrome/63/overscroll-behavior.html)，怕会有被墙的风险，我把源码放到了自己的博客，可以分别用 Android 和 iOS 手机体验一下，然后在 PC 上进入页面查看源码看看门道应该对 `overscroll-behavior` 就彻底了解了。

### 获取用户许可界面 UI 升级

在 Chrome 63 版本之前，Chrome 总是会在不经意之间就会弹出一个对话框要求用户选择授权还是拒绝某一个许可询问，这时候用户往往是懵逼的，因为弹框没有任何的介绍和描述，让用户产生一种不信任的感觉。

Chrome 63 版本开始 Android 版本改进了获取用户许可界面 UI，是一个描述详细的询问弹窗，如下图所示：

![modal-permission-clipped](./modal-permission-clipped.jpg)

当然啦，这个不仅仅是为 Notification 许可获取来设计的，是为任何需要获取许可的操作设计的。

> PS: 如果你在 [合适的场景和时机](https://developers.google.com/web/fundamentals/push-notifications/permission-ux) 下获取用户许可，可以获得更多的 `allow` 选项 :P

### 更多新特性

除了以上所提到几个新特性外，在一些细节上， Chrome 63 版本同样也有一些升级，

**Promise 新增 finally 原型方法**

Promise.prototype.finally 在  V8 v6.3.165+ 中已经被支持了，Chrome 63 版本中也新增了支持，它用来定义一个无论是 resolve 还是 reject 都会被调用的 callback 函数。

以前我们做 Ajax 请求的 loading 效果必须要这么写代码：

```js
const fetchAndDisplay = ({url, element}) => {
    showLoadingSpinner();
    fetch(url)
        .then(response => response.text())
        .then(text => {
            element.textContent = text;
            // 做个成功的处理
            hideLoadingSpinner();
        })
        .catch(error => {
            element.textContent = error.message;
            // 做个失败的处理
            hideLoadingSpinner();
        });
};

fetchAndDisplay({
    url: someUrl,
    element: document.querySelector('#output')
});
```

现在只要 finally 中处理一次就可以了：

```js
const fetchAndDisplay = ({url, element}) => {
    showLoadingSpinner();
    fetch(url)
        .then(response => response.text())
        .then(text => {
            element.textContent = text;
        })
        .catch(error => {
            element.textContent = error.message;
        })
        .finally(() => {
            // 只需要做一次处理就好
            hideLoadingSpinner();
        });
};
```

**Device Memory JavaScript API**

Chrome 63 版本根据 W3C 关于 Device Memory 的讨论实现的 [Device Memory JavaScript API](https://github.com/w3c/device-memory#the-web-exposed-api) 可以通过给出有关用户设备上 RAM 总量的提示，帮助您了解设备的性能限制。你可以在运行时调整您的体验，降低低端设备的复杂性，为用户提供更好的体验，做到 runtime 优雅降级。

```js
console.log(navigator.deviceMemory); // 是一个浮点数
```

关于 Device Memory，可以去 [Google Chrome 官方博客](https://developers.google.com/web/updates/2017/12/device-memory) 查看详细的介绍。

**Intl.PluralRules API**

Intl.PluralRules API 可以用来处理语言多元化问题。
可以查看 [Chrome 官方博客](https://developers.google.com/web/updates/2017/10/intl-pluralrules) 查看 API 详细信息。

## DevTools 升级部分

Chrome 63 版本在 DevTools 上带来了较多的惊喜，其中重点支持了 Service Worker 相关特性的调试以及周边的支持，从我个人的角度来看， Chrome 63 版本的 DevTools 之所以对 PWA 特性调试方面的不断深入支持，其实恰恰可以反映初当前 Google 对 PWA 的重视程度。下面我们具体看看本次 DevTools 升级的重点，主要升级有以下几点：

- 支持多端远程调试
- 发布 Workspaces 2.0
- 新增 4 个 Audits
- 支持用自定义数据模拟 Push Notification
- 支持用自定义数据触发 background sync 事件

### 支持多端远程调试

如果你之前尝试过在 IDE （VSCode 或者 WebStome）里调试站点的话，你就会发现打开 DevTools 就让你的调试会话周期变得乱七八糟，所以别还是别想用 DevTools 来调试 WebDriver 相关的东西了。

在 Chrome 63 版本中， DevTools 最新默认支持了多端远程调试功能，不需要任何配置就可以直接用了。多端支持也为带有 DevTools 的其他工具创造了很多有意思的机会，或者用其他姿势使用那些工具，比如像以下这些方式：

- 协议客户端，比如 ChromeDriver 或者 VsCode 和 Webstorm 的 Chrome 调试插件。
- Websocket 客户端，比如 Puppeteer 现在直接可以与 DevTools 同时运行啦。
- 两个 WebSocket 协议客户端，比如 Puppeteer 或者 chrome-remote-interface 现在可以同时连接到同一个标签。
- 使用 `chrome.debugger` API 的 Chrome 插件现在可以和 DevTools 同时运行。
- 多个使用 `chrome.debugger` API 的不同的 Chrome 插件可以同时在一个标签。

### Workspace 2.0

Workspace 在 DevTools 里面也已经有一段时间了，它可以让你像使用 IDE 一样使用你的 DevTools，你可以在 DevTools 里修改你的源代码，并且这些改动直接映射到你本地的文件系统中。

Chrome 63 版本这次升级的 WorkSpace 2.0 是建立在之前 WorkSpace 1.0 版本基础上的，添加更实用用的交互体验，并改进传输代码的自动映射机制，此功能原定于 Chrome Developer Summit（CDS）2016 后不久发布，但团队因为要解决一些问题所以耽搁了 ：）， 毕竟好事多磨嘛。

WorkSpace 2.0 的内容太多了，我在这里还是放一个我的偶像 [Paul Irish](https://github.com/paulirish) 的 [Youtube 的视频地址](https://youtu.be/HF1luRD4Qmk) 吧，需要翻墙，有兴趣的可以看看，或者亲自去 Chrome 63 版本上去体验一下就一目了然啦～

### 新增 4 个 Audits

DevTools 里的 Audits 标签其实就是跑 [Lighthouse](https://developers.google.com/web/tools/lighthouse/#devtools) 这次在 Chrome 63 版本里 DevTools 中新增了 4 个新的 Audits，其实也是 Lighthouse 新增的 4 个 Audits:

- 使用 Webp 图像
- 使用具有适当宽高比的图像
- 避免使用具有已知安全漏洞的前端 JavaScript 库。
- 打到 console 中的浏览器错误日志

### 模拟 Push Notification

模拟 Push Notification 功能在 DevTools 里已经有一段日子了，但是有个限制，你不能发送自定义的数据，现在可以啦，Chrome 63 版本的 DevTools 里 Application 标签中的 Service Worker 面板中出现了新的输入框，可以让你发送自定义数据。你可以根据以下步骤尝鲜：

1. 进入 这个 [Push Notification Demo 页面](https://gauntface.github.io/simple-push-demo/)(墙外)
2. 点击 **Enable Push Notifications**
3. 当 Chrome 弹窗让你授权的时候点击 **Allow**
4. 打开 DevTools
5. 进入 Application 标签下 的 Service Worker 面板
6. 在 Psuh 那个输入框随便写点啥

<img src="./push-text.png" alt="Push 模拟自定义数据" style="border:0;"/>

7. 点击 **Push** 发送消息

<img src="./push-result.png" alt="Push 模拟自定义数据" style="border:0;"/>

目前在墙内感觉好无助好心酸，感觉是个蛮鸡肋的功能，但是国外小伙伴应该蛮喜欢的吧，确实看着好方便。

### 触发 background sync 事件

触发 background sync 事件在 Service Worker 面板里也是存在有段时间了，但是你现在可以发送自定义的东西啦，同样你也可以通过以下步骤尝鲜：

1. 打开 DevTools
2. 到 Applications 标签下的 Service Worker 面板
3. 在 **Sync** 输入框中随便写点啥
4. 点 **Sync**

<img src="./sync.png" alt="Push 模拟自定义数据" style="border:0;"/>

## 废弃的部分

此次 Chrome 63 的发布也禁用或废弃了一些功能和特性：

- 返回 Promise 对象的接口不会再抛异常了
- 去除 `getMatchedCSSRules()`
- 去除 `negotiate` 的 RTCRtcpMuxPolicy
- ...

详细的内容可以查看 [Google Chrome 官方博客](https://developers.google.com/web/updates/2017/10/chrome-63-deprecations) 的说明，有兴趣的同学也可以查看相关的背景。

## 参考资料

- https://developers.google.com/web/updates/2017/12/nic63
- https://tc39.github.io/proposal-dynamic-import/
- https://jakearchibald.com/2017/async-iterators-and-generators/
- https://ponyfoo.com/articles/javascript-asynchronous-iteration-proposal
- https://github.com/w3c/device-memory#the-web-exposed-api
