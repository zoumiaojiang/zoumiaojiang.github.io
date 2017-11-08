---
title: Chrome 62 的新鲜货
catalog: true
subtitle:
header-img: chrome.jpg
tags: 
- Chrome
categories: 
- Chrome
---

2017/10/18 ，Google Chrome 又悄悄的发布了 Chrome 的新版本 - Chrome 62 稳定版，Mac、GNU/Linux、Windows 用户都可以立即升级（Chrome 也会提示没升级的用户升级）。这次又我没跟上步伐及时整理。。我只是想了解每个 Chrome 版本的新特性，毕竟 Chrome 现在是走在新时代的开路先锋。本系列的内容都是基本来自于 [Chrome developer 官方博客](https://developers.google.com/web/updates/) 的自我理解的一些整理。

闲话不多说，来看一下 Chrome 62 版本有哪些新鲜货吧。我们还是从 `新特性`、`DevTools`、 `废弃的内容` 三个部分来看看 Chrome 62 有哪些调整。

## 新特性

chrome 62 增加了一些新特性：

- Network Information API 更精准
- 支持 OpenType 可变字体
- 动态从媒体 Dom 元素获取 stream 内容
- HTTP 站点都会被标 `不安全`
- 一些特性升级

### Network Information API 更精准

[Network Information API](https://wicg.github.io/netinfo/) 已经在 Chrome 上存在了好多个版本了，但是之前的 API 只能提供用户连接的网络的理论上网络速度（说白了，都靠瞎猜），有这么一种情况：你的手机 WIFI 连接了一个 2g 网络手机开的热点，那网络信息 API 的返回结果是什么呢？

```js
// 之前的 api 为 navigator.connection.type
console.log(navigator.connection.type);
// wifi
```

答案是 WIFI， 这显然在实际应用中会耽误一些产品策略和统计策略的，效果非常的不好，在 Chrome 62 版本，考虑到了这个问题，[升级](https://www.chromestatus.com/feature/5108786398232576) 了此 API 的实践，能够给出用户客户端真实的网络质量。通过这些网络质量的信号，就能够根据不同的网络质量定制不同的网页内容，比如网速好，在 WIFI 环境下，就多展现点图片，在网络环境差的条件下，就展现纯文字。产品策略有真实准确的数据作为依据了。

为了简化 Web App 的判断逻辑，Chrome 62 中直接返回的值是用当前的网络环境和蜂窝煤网络连接比较的结果，比如监测到当前网络连接到了超高速光纤网络，就返回 `4g`。

```js
// chrome 62 的 api 实现为 navigator.connection.effectiveType
console.log(navigator.connection.effectiveType);
// 4g
```

当然这些结果还可以通过 [Client Hints](http://httpwg.org/http-extensions/client-hints.html) 写入 HTTP 请求头，这样服务端就能知道当前的真实的网络状态啦，这样就更好做服务端的一些策略了，能做的事情就太多了。。这里有个测试的 [小例子](https://googlechrome.github.io/samples/network-information/)，蛮有意思的。

### OpenType 可变字体

一般来说，我们都知道一个 font-famliy 对象只能包含一个字体，也就是说，只能有某一种 weight 或 stretch， 如果你想要 `regular`、`italic`、`bold` 三种字体特性，那你必须引入三个独立的字体文件来满足你的需求。

一个 OpenType 可变字体相当于被打包到一个字体文件中的多个单独的字体，在 Chrome 62 中，通过调节 `font-variation-settings` CSS 属性。可以很容易的调节 weight 和 stretch 等值，提供了大量的样式变化，通过这种方式，之前说的三种单独的字体文件现在可以打包到一个字体文件里了。

```css
/* Avenir Next Variable 是一个 OpenType 可变字体 */
.heading {
    font-family: "Avenir Next Variable";
    font-size: 48px;
    font-variation-settings: 'wght' 700, 'wdth' 75;
}
.content {
    font-family: "Avenir Next Variable";
    font-size: 24px;
    font-variation-settings: 'wght' 400;
}
```

以后的网页上有以下这种效果的文字排版可别觉的惊讶：

<video autoplay="" loop="" muted="">
    <source src="./otvfont.webm" type="video/webm">
    <source src="./otvfont.mp4" type="video/mp4">
</video>

太神奇了，OpenType 可变字体给了我们一个响应式排版的强大工具，并且减少网页加载的字体文件数量。对于 OpenType 可变字体，想要深入了解的可以参考如下文章：

- [英文原文: https://medium.com/@tiro/https-medium-com-tiro-introducing-opentype-variable-fonts-12ba6cd2369](https://medium.com/@tiro/https-medium-com-tiro-introducing-opentype-variable-fonts-12ba6cd2369)
- [中文译文: https://coyee.com/article/11133-introducing-opentype-variable-fonts](https://coyee.com/article/11133-introducing-opentype-variable-fonts)

### 动态从媒体 Dom 元素获取 stream 内容

在 Chrome 62 开始，可以直接从 `HTMLMediaElement` 标签（比如: video, audio 等）中获取内容到 `MediaStream` 中。

在 HTMLMediaElement 上调用 `captureStream()` 方法之后，stream 内容就可以被操纵，处理，远程发送或记录。可以想象一下在 Web App 中使用 web 音频去创造自己的均衡器和声音合成机等，或者使用 WebRTC 将内容流式传输到远程站点，这种可以直接获取 stream 的方式可以衍生的产品设计可能性很多，想象空间很大。

下面就是一个 WebRTC 的例子，可以远程操作 cavas 的内容，很酷吧？

<video autoplay="" loop="" muted="" style="width:60%;">
    <source src="./canvas-pc.webm" type="video/webm">
    <source src="./canvas-pc.mp4" type="video/mp4">
</video>

```html
<video id="videotag" width="320" height="240" muted="true" controls autoplay>
</video>
```

```js
// 获取 stream
let theStream = document.getElementById("videotag").captureStream();

// 将 stream 转成 URL 给另一个 video？ ... 在这之前还可以做任何操作
let  videoSrc = URL.createObjectURL(theStream);
```

### HTTP 站点都会被标 `不安全`

这个没有什么好说的，就是 Chrome 62 释放出一个信号 --- HTTP 站点都终将被 HTTPS 所全部替代

不安全的样子：

![不安全的 http](./unsafe.png)

安全的样子：

![安全的 https](./safe.png)

### 其他的特性

- Chrome 62 iOS 版支持了 [支付请求接口(Payment Request API)](https://developers.google.com/web/fundamentals/payments/) 
- 在 Chrome 62 中可以通过 [WebVR 源实验](http://bit.ly/OriginTrialSignup) 构建实验性质的富 VR 体验。

延伸阅读：

- https://developers.google.com/web/updates/2017/09/webvr-origin-trial-chrome-62
- 

## DevTools 升级部分

本次 Chrome 62 的升级在 DevTools 方面带来了很多升级和变化。
 