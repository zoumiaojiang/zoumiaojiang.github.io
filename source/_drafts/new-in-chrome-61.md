---
title: chrome 61 的新鲜货
catalog: true
subtitle:
header-img: chrome.jpg
tags:
- Chrome
categories:
- Chrome
---

Google Chrome 团队前段时间发布了 Chrome 61 版本，还是有一些非常有诚意的新特性呈现出来，非常感谢 Chrome 团队的贡献 🙏， 我们从`新特性`、`DevTools`、 `废弃的内容` 三个部分来看看 Chrome 61 有哪些调整吧。

## 特性部分

Chrome 61 新增了一些新特性:

* 支持原生的 JS Module
* 支持了 `navigator.share` web Share API
* 支持了WebUSB API
* 前面版本的一些优化

### 支持原生 JavaScript Module

Chrome 61 版本原生支持了 JavaScript Module 特性，也就是说在 Chrome 上跑 JS 模块化的代码，就可以完全不需要 babel 了，Chrome 61 的做法是通过 `<script type="module">` script 标签的方式实现的：

```html
<script type="module">
    import {someFunction} from './some-module.js';
    // 调用模块方法
    someFunction();
</script>
```

此次支持的的 JS Module 有这么几个事情 Chrome 61 版本也是考虑到了的：

* 并行的加载所有的 JavaScript Module 模块
* 模块文件缓存
* 避免重复加载
* 顺序执行

[在 Chrome 61 环境下戳我！- JavaScript Module Demo](/demo/chrome/61/js-module/index.html)

> 在将来，同样的原生 module 机制也会在 Node.js 中被实现，这样比较方便写出同构的原生 es6 代码，虽然现在借助 babel 也能做到。

如果想要对 ES6 的模块有更深刻的了解，可以阅读一下以下文章：

* [Chrome Ststus](https://www.chromestatus.com/feature/5365692190687232)
* [ES Modules in Browsers](https://jakearchibald.com/2017/es-modules-in-browsers/)
* [ES6 Modules in Depth](https://ponyfoo.com/articles/es6-modules-in-depth)

### 支持 web Share API

我们总有把网页分享到各种社交应用的需求，比如分享到微博，微信什么的，做过类似需求的开发者都知道，每个 app 都几乎有一套自己的分享 api，比如微信 sdk 啥的，如果你想在浏览器里面点击一个分享按钮分享的话，那只能依赖一个第三方的分享 js sdk， 搞来搞去可能还不满足自己的需求，或者太难看。

现在介绍一下 web Share API，web Share API 就是可以自定义分享的 API，有以下特性：

* 可以让你在支持的 webview 自定义调起原生的分享弹层
* 可以在支持的 webview 自定义分享任何文本或链接
* 可以用自定义的参数来控制分享的内容和分享的目标

> webview 可以指的是任何支持 web Share API 的浏览器或者 App。

现在在 Android Chrome 61 已经支持了 web Share API 了，弹出的原生的 Android 弹框效果如下图所示：

<img src="https://user-images.githubusercontent.com/3365978/31727693-d862cc5c-b3ef-11e7-9ef8-c13d126df789.png" alt="web share api" style="border:none;"/>

有个 [视频](https://www.youtube.com/watch?v=2vJm1Gfn0ng) 可以观赏一下。

在网页中只要简单的使用 `navigator.share` 方法，就可以在 Android Chrome 中调起分享弹框了，并且可以使用这个方法随意自定义分享功能。

#### API 用法

web Share API 是一个基于 Promise 的一个 API 方法，这个方法接受一个至少包含 `text` 或 `url` 字段的对象参数，代码如下：

```js
if (navigator.share) {
    navigator.share({
        title: 'Peace - zoumiaojiang\'s Blog',
        text: 'This is a cool blog!',
        url: 'https://zoumiaojiang.com',
    })
    .then(() => console.log('Successful share'))
    .catch(error => console.log('Error sharing', error));
}
```

使用 web Share API 确实是非常方便，至少目前在 Android Chrome 61 可以减少无谓的第三方分享 js sdk 引用，而且原生的体验肯定会好很多，但是 web Share API 需要注意一些问题：

* 页面必须是 https 的（chrome 是铁了心的强制 https 了，赞）
* 只能由用户交互触发（就是不能使用程序自动触发，有点类似 video 标签的播放功能）
* 可以分享任何 url 或 text，不局限于当前站点的域
* 应该做特性嗅探判断是否支持此 API

#### 分享的 URL 最佳实践

通常来说呢，web Share API 是能分享任何的 URL 的，但是有的时候你的站点是一个详情页，或者是一个需要登录才能进入的活动页，这时候你分享出去的页面可能是一个通用的分享页，当然，可以在每个页面里都调用 `navigator.share` 方法，但是，如果你想为你整个系统做一个通用的活动分享模块，会被很多活动页调用该怎么办呢？或者每个活动页所对应的分享页也不一样又怎么办呢？

这时候我们应该考虑讲这个分享页的 URL 注入在页面中，而不是需要在 `navigator.share` 方法中硬编码。

```html
<!--活动页 html-->
<head>
    <link rel="canonical" href="https://yourhost/share" />
</head>
```

```js
// share-module.js
let url = document.location.href;
let canonicalElement = document.querySelector('link[rel=canonical]');
if (canonicalElement !== null) {
    url = canonicalElement.href;
}
navigator.share({url});
```

想深入的了解 web Share API ，可以参考 [Google Developer 的文档](https://developers.google.com/web/updates/2016/09/navigator-share)

### 支持 web USB API

大部分的外接硬件设备都是由更高 level 的 web 平台支持的，比如键盘、鼠标、打印机、游戏手柄等。但是在浏览器上使用 USB 外接设备特别费劲，通常需要借助一些特殊的驱动来辅助。

在 Chrome 61 版本中，支持了 WebUSB API，在用户授权之后，允许 web app 可以直接和 USB 设备通信，Chrome 61 中实现的 WebUSB API 是参照 W3C WebUSB API 草案来实现的，[草案](https://wicg.github.io/webusb/) 中详细的列出了如何考虑安全和隐私相关的问题。

<img src="https://user-images.githubusercontent.com/3365978/31731511-ebc041c0-b3fa-11e7-83bf-0ef0a0563e45.png" alt="webUSB API"  style="border:none;"/>

详细的 WebUSB 的介绍，可以阅读 [Google Developer webUBS 文档](https://developers.google.com/web/updates/2016/03/access-usb-devices-on-the-web) 查看。

### 其他特性

在 Chrome 61 版本中，也升级和改进了一些其他的小的地方：

* [scroll-behavior](https://drafts.csswg.org/cssom-view/#smooth-scrolling) CSS 属性表现的更加平滑了
* CSS color 的值支持了 alpha 透明特性（16 进制的）

```css
    /* Hexadecimal syntax with alpha value */
    #f09f
    #F09F
    #ff0099ff
    #FF0099FF
```

* 可以通过 [Visual Viewport API](https://developers.google.com/web/updates/2017/09/visual-viewport-api) 获取屏幕上内容的相对位置

## DevTools 部分

## 废弃部分

### 安全和隐私方面

### CSS 方面

### JS 方面
