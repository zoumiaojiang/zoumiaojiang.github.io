---
title: Chrome 62 的新鲜货
catalog: true
header-img: chrome.jpg
tags:
  - Chrome
categories:
  - Chrome
date: 2017-11-09 00:49:13
subtitle:
---


2017/10/18 ，Google Chrome 又悄悄的发布了 Chrome 的新版本 - Chrome 62 稳定版，Mac、GNU/Linux、Windows 用户都可以立即升级（Chrome 也会提示没升级的用户升级）。这次又我没跟上步伐及时整理。。我只是想了解每个 Chrome 版本的新特性，毕竟 Chrome 现在是走在新时代的开路先锋。本系列的内容都是基本来自于 [Chrome developer 官方博客](https://developers.google.com/web/updates/) 的自我理解的一些整理。

闲话不多说，来看一下 Chrome 62 版本有哪些新鲜货吧。我们还是从 `新特性`、`DevTools`、 `废弃的部分` 三个部分来看看 Chrome 62 有哪些调整。

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

<video autoplay="" loop="" muted="" style="width: 100%;display:block;max-width:360px;margin: 0 auto;">
    <source src="./otvfont.webm" type="video/webm">
    <source src="./otvfont.mp4" type="video/mp4">
</video>

太神奇了，OpenType 可变字体给了我们一个响应式排版的强大工具，并且减少网页加载的字体文件数量。对于 OpenType 可变字体，想要深入了解的可以参考如下文章：

- [英文原文: https://medium.com/@tiro/https-medium-com-tiro-introducing-opentype-variable-fonts-12ba6cd2369](https://medium.com/@tiro/https-medium-com-tiro-introducing-opentype-variable-fonts-12ba6cd2369)
- [中文译文: https://coyee.com/article/11133-introducing-opentype-variable-fonts](https://coyee.com/article/11133-introducing-opentype-variable-fonts)

### 动态从媒体 Dom 元素获取 stream 内容

在 Chrome 62 开始，可以直接从 `HTMLMediaElement` 标签（比如: video, audio 等）中获取内容到 `MediaStream` 中。

在 HTMLMediaElement 上调用 `captureStream()` 方法之后，stream 内容就可以被操纵，处理，远程发送或记录。可以想象一下在 Web App 中使用 web 音频去创造自己的均衡器和声音合成机等，或者使用 WebRTC 将内容流式传输到远程站点，这种可以直接获取 stream 的方式可以衍生的产品设计可能性很多，想象空间很大。

下面就是一个 WebRTC 的例子，可以远程操作 cavas 并映射到另一个 cavas，很酷吧？

<video autoplay="" loop="" muted="" style="width: 100%;display:block;max-width:360px;margin: 0 auto;">
    <source src="./canvas-pc.webm" type="video/webm">
    <source src="./canvas-pc.mp4" type="video/mp4">
</video>

```html
<video id="videotag" muted="true" controls autoplay>
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
- Chrome 62 中可以通过 [WebVR 源实验](http://bit.ly/OriginTrialSignup) 构建实验性质的富 VR 体验。

延伸阅读：

- https://developers.google.com/web/updates/2017/09/webvr-origin-trial-chrome-62

## DevTools 升级部分

本次 Chrome 62 的升级在 DevTools 方面带来了很多升级和变化，实测发现 Chrome 62 确实提供了蛮多有用的 DevTools 特性。

### console 控制台可以直接使用 await 操作了

<img src="./await.png" alt="console await" style="border:0;"/>

以后就可以在 console 控制台中直接看 promise 的结果了，尤其是现在很多 API 都是 promise-base 的。比如上图的 fetch 接口，感觉酷酷的。

### 支持截图了

Chrome 62 的 DevTool 支持了 viewport 内的截图，或者特点 Dom 节点的截图。这个特性我个人感觉还是蛮实用的，尤其是可以获取某些 Dom 渲染的内容截图。。

<img src="./screenshot.png" alt="console await" style="border:0;"/>

怎么触发整个 **viewport 截图功能** 呢？可以按照以下步骤：

1. `Command + Option + I(Mac)` / `F12(Windows, Linux)` 打开 DevTool 模式。
2. `Command + Shift + C(Mac)` / `Ctrl + Shift + C(Window, Linux)` 打开查看元素模式。
3. 按下 `Command(Mac)` 或 `Ctrl(Windows, Linux)` 按下鼠标左键去选择想要截取的区域。
4. 选好之后就放开鼠标，这样就会开始下载刚才截取的图片。

> 个人觉的 Chrome 62 DevTools 这个交互太繁琐而且不好操作，特别容易误操作，没有任何确认修改的步骤就直接会下载图片，希望后续能看到改进。

怎么触发 **截取 Dom 元素特定截图** 呢？

1. 在 Elements 标签下选中所要截取的 DOM
2. Command + Shift + P(Mac) 或者 Ctrl + Shift + P(Windows, Linux) 打开命令行工具。
3. 输入 `node` 并选择 `Capture node screenshot`, 就直接可以下载了当前 Dom 的截图了。

这个功能太赞了，截出来的图片非常独立干净，并自带系统窗口阴影，效果非常好。

### CSS Grid 布局高亮显示

当进入 DevTools 模式中，进入选中元素的状态时候，在 Elements 标签下，当鼠标移动经过 `display: grid;` 的 DOM 的时候，则所有的 Gird item DOM 都会出现点状边框，当鼠标点击选中某个 Grid item 的时候，就会高亮展现这个 item 的布局的区域。

<img src="./css-grid-highlighting.png" alt="css-grid-highlighting" style="border:0;"/>

### 支持 queryObjects API

Call queryObjects(Constructor) from the Console to return an array of objects that were created with the specified constructor. For example:

在 Consoles 控制台里调用 `queryObjects(Constructors)` 会返回包含指定构造函数所构建的所有的对象的数据。比如：

- `queryObjects(Promise)` 会返回所有 Pormise 对象
- `queryObjects(HTMLElement)` 会返回所有的 HTML 元素
- `queryObjects(foo)` 会返回所有用 foo 构造函数构造出来的对象

queryObjects API 的作用域就是当前 consoles 所运行的作用域，这个功能特性为后续 JS 排除问题提供了很有利的帮助。

### Console 控制台过滤

现在 Console 控制台支持了否定过滤和 URL 过滤两种过滤。

**否定过滤** 

否定过滤就是在过滤输入框中输入 `-<text>` 能过滤掉任何包含 `<text>` 的信息的 console 输出。

<img src="./negative-filter.png" alt="negative-filter" style="border:0;"/>

DevTools 的否定过滤到底是什么策略呢？在什么时候下会生效呢？DevTools 过滤掉一条信息当发现 `<text>` 存在如下情况:

- 在打印信息文本中
- 存在在打印消息的文件的文件名中
- 在堆栈信息文本中

**URL 过滤**

在过滤输入框中输入 `url:<text>` 可以使控制台仅仅显示包含 `<text>` 的 JS 脚本 URL 打印出来的信息。这种过滤采取的模糊匹配，只要 `<text>` 在  脚本 URL 的任何地方出现，DevTools 就会打印该脚本打印出的信息。

<img src="./url-filter.png" alt="url-filter" style="border:0;"/>

### 将 HAR 文件导入 Networks 面板

HAR（HTTP 档案规范），是一个用来储存 HTTP 请求/响应信息的通用文件格式，基于 JSON。这种格式的数据可以使 HTTP 监测工具以一种通用的格式导出所收集的数据，这些数据可以被其他支持 HAR 的 HTTP 分析工具（包括 Firebug、httpwatch、Fiddler 等）所使用，来分析网站的性能瓶颈。

<img src="./har-import.png" alt="har-import" style="border:0;"/>

这样，Chrome 就能当成一个网络分析器了，最主要的可以借助这个特性来分析我们一直头疼的移动端的网络请求性能啦。

### 在 Application 面板中可以预览 Cache 资源

对于 Chrome 团队来说可能这只是一个简单的特性，但是确实方便了开发者，有时候我们就是想要看看被 CacheStorage 缓存的内容是些什么，但是并不能预览，现在提供这个功能之后，所有的缓存内容一目了然。

<img src="./cache-preview.png" alt="cache-preview" style="border:0;"/>

### 升级了代码块级别的覆盖率问题

现在的 Coverage 标签会告诉你代码块级别的哪个函数被调用，哪些没被调用。

<img src="./coverage-after.png" alt="coverage-after" style="border:0;"/>


## 废弃的部分

此次 Chrome 62 的发布也禁用或废弃了一些功能和特性：

- 移除 `RTCPeerConnection.getStreamById()`
- 移除 `SharedWorker.workerStart`
- 移除 `SVGPathElement.getPathSegAtLength()`

详情可以查看 [Google Chrome 官方文档](https://developers.google.com/web/updates/2017/09/chrome-62-deprecations)