---
title: 聊一聊 Andorid Chrome 的下拉刷新
catalog: true
header-img: chrome.jpg
tags:
  - Lavas
  - PWA
  - Chrome
categories:
  - 知识点
date: 2017-09-20 01:16:14
subtitle:
---


## 背景

最近在做 Lavas App 相关的项目，Lavas App 是一个可以将 PWA 站点打包成 Andorid App 的 [在线打包工具](https://lavas.baidu.com/app)。当用户的安卓设备或者浏览器不支持 PWA 特性的时候，可以引导用户安装一个小的 Apk 文件，这个 Apk 文件安装后就是一个 PWA 在桌面上的入口，代替了 `manifest.json` 添加到桌面上的功能，Lavas App 导出的 App 内置了 Service Worker 等 PWA 特性，这在一定程度上缓解了了当前国内 PWA 在不同浏览器上支持情况的混乱局面，可以让一部分用户享受到 PWA 的便利。

然而，由于 Lavas App 导出的 App 采用的是 `manifest.json` 标准中的 [standalone 模式](https://lavas.baidu.com/doc/engage-retain-users/add-to-home-screen/improved-webapp-experience#设置启动显示类型) 展现，也就是说 - **浏览器相关UI（如导航栏、工具栏等）将会被隐藏**。这样我们就找不到入口放置 `返回`, `刷新` 等本来在浏览器导航栏的功能按钮，`返回` 可以直接用 Android 的系统返回按键来操作，但是 刷新我们并没有想到什么好办法来解决，而用户对刷新的需求又是强依赖的。在这点上，Chrome 对于 PWA 添加到桌面上的实现体验还是很棒的，Chrome 将 PWA 站点添加到桌面后，可以通过下拉刷新的隐性方式解决没有显性刷新按钮的问题。所以我们决定在 Android 的 Lavas App 下也要实现一个类似于 Chrome 的下拉刷新的功能。然后的然后，就出现了今天这篇文章。

如何实现类似于 Chrome 的下拉刷新呢？我们这里就不讲具体实现了，我们只是单纯的来讨论一下这个看起来很简单的功能的实现原理。

为啥不讨论 iOS 的 Chrome 下拉刷新？因为 iOS 还没支持 PWA 特性，Lavas App 就没搞 iOS 版了，所以就没有研究 iOS 下的 Chrome 下拉刷新的功能，但从表现上来看，Android 和 iOS 的 Chrome 下拉刷新实现应该是一样的，但是禁用下拉刷新的方式还是有点不一样的，后续有机会再研究研究吧 iOS 的下拉刷新 _**@TODO**_。

## 下拉刷新

还是先认识一下下拉刷新这位同志吧，Chrome 从 41 版本就开始支持了 `下拉刷新` 的这个功能，目前应该被众多的用户所接受，当然不仅仅是 Chrome 支持了这个功能点，很多 App 都有支持，比如需要经常刷新的新闻类的 App， 社交类的 App 等，随处都可以看得到。今天也是个机会来搞清楚这个看似简单的功能到底是怎么实现的。

Android Chrome 的下拉刷新的效果图如下：

<img src="https://user-images.githubusercontent.com/3365978/30590887-1fcafeae-9d73-11e7-902f-cb0c575fab50.gif" width=60%  alt="Android Chrome 的下拉刷新"/>

从这动图上可以看出，下拉刷新的功能就是用户向在页面无法向下滚动的时候下拉页面，会出现一个 loading 的状态，标识页面正在刷新中。这样一个在 Android Chrome 上简单的功能，就是今天这篇文章的所要讲的。

关注下拉刷新这个功能本身的同时，我们更关注的是这个功能在什么情况下能够触发？在用户使用的角度，用户向下拉一下页面，就可以触发下拉刷新，然后页面就被刷新了，但是从技术实现的角度怎么来分析这个问题呢？

### 滚动过界闪烁

在分析如何触发下拉刷新功能之前，需要先了解一下 `滚动过界闪烁(Overscroll Glow)`，下图是滚动过界闪烁的一个效果：

<img src="https://user-images.githubusercontent.com/3365978/30600883-2898d16c-9d93-11e7-9e56-bbebc4aefa5c.png" width=60%  alt="滚动过界闪烁提示"/>

这个效果还是挺常见的把？在 Andorid Chrome 中，当页面在可滚动的最顶端的时候，你往下猛拉页面就会出现这种效果，那么当时在 Android Chrome 下需要满足什么条件可以触发滚动过界闪烁效果呢？

其实只要满足以下条件，就可以触发出滚动过界闪烁的效果。

* 可视区域必须可以滚动
* 可视区域还有一个较大的滚动 offset（也就是初始滚动条不是在最顶端）
* 可视区域在不可滚动的方向有滚动增量（说人话就是：到了不能滚动的地方还硬拉）

并且，光影的效果和你往不可滚动的方向滚动的增量（叫力度，或者手指滑动的距离都一个意思）是相关的。其实通过直白的话来描述触发这个滚动过界闪烁就是当你的网页可滚动，你从一个滚动条的 offset 的地方直接将页面拉到底不放手，就会出现过界闪烁的效果。

### 如何触发下拉刷新

了解了出现滚动过界闪烁效果的原理之后，就很好理解如何触发 Android Chrome 的下拉刷新了，从 Android Chrome v41 版本后，新增了下拉刷新的功能，这个功能就是在 `滚动过界闪烁` 的基础上配合了浏览器 touch 事件实现的，只是在触发滚动过界闪烁的基础上增加以下几个条件就能触发下拉刷新效果。

* 滚动序列必须是在页面 y 轴的滚动 offset 为 0 (就是滚动条在最顶端的时候) 的时候开始的
* 初始滚动增量的方向必须向上（用户是向下滚动），也就是说，初始滚动方向要在不可滚动的方向
* 在 touchend 事件触发之后，累计的不可滚动方向的增量需要达到一定的阈值（阈值的设计就是衡量下拉刷新的灵敏度）

只要满足滚动过界闪烁和以上三个条件的情况下，就可以触发下拉刷新效果了。当然这些判断都是需要由浏览器内核完成计算，然后由浏览器 UI 实现刷新效果就 ok 了。

## 网页中禁用下拉刷新

虽然 Chrome 提供了下拉刷新的功能，但现在的 Web App 也会有很多的自己自定义的手势操作，用户很容易造成误伤，所以并不是每个产品设计师都喜欢在自己的 Web App 上有这个下拉刷新的功能，如果有的 PM 就是不希望自己的网页被刷新怎么办？遇到这样的需求作为苦逼的 Web App 开发者也是很无奈啊，好在 Andorid Chrome 还是提供了几种方式来禁用下拉刷新这个功能。其中有的可以是开发者在自己的网页中做些什么就可以禁用，有的是用户可以通过浏览器设置可以禁用。

### touch-action: none

可以通过设置 Root Element（也就是 html 元素）的 `touch-action` 属性值为 `none` 的方式来禁用 Android Chrome 的下拉刷新的功能，这种情况下，只要开发者写了下面这段 css 代码，基本就搞定了。

```css
html {
    touch-action: none;
}
```

可以在 Android Chrome 上看看这个 [touch-event Demo](https://zoumiaojiang.win/demo/chrome/disable-pull-refresh-by-touch-action-none.html)，这种禁用方式有个弊端，就是必须要设置在页面的 Root Element（也就是 html 元素）上，我们来总结一下这种方式：

* 如果在 html 元素上设置了 `touch-action: none`，整个页面的 touch 事件失效，也就是说不仅禁用掉了下拉刷新功能，连整个页面都不能滚动。
* 当页面中元素含有 `overflow` 属性的时候，`touch-action: none` 禁用刷新失效（不知道算不算 Chrome 的一个 bug）

```html
<!DOCTYPE html>
<html lang="en">
<head>
<style>
    html {
        touch-action: none;
    }
    .wrapper {
        /* 加上这个之后 touch-action: none 就会失效 */
        overflow: auto;
    }
    .content {
        /* 让页面产生滚动条 */
        height: 2000px;
    }
</style>
</head>
<body>
    <div class="wrapper">
        <div class="content">
            some text
        </div>
    </div>
</body>
</html>
```

从 `touch-action: none;` 在 Andorid Chrome 上表现的特性看来，这种方式只是比较适用于禁止单页全屏并且无交互的静态页面下拉刷新了，一般情况下都不使用这种方式禁用 Android Chrome 的下拉刷新功能。

### overflow-y: hidden

还有个最简单的方式在 Android Chrome 上禁用下拉刷新的功能，只需要对 body 元素设置 `overflow-y: hidden;` 就搞定了。

具体效果可以用 Android Chrome 访问 [overflow-y: hidden Demo](https://zoumiaojiang.win/demo/chrome/disable-pull-refresh-by-overflow-y-hidden.html)

```css
body {
    overflow-y: hidden;
}
```

通常这种做法会导致整个 body 不会产生滚动条了，如果既要禁用 Android Chrome 的下拉刷新，又要页面可以正常上下滚动，只能人为的强制造一个 Dom 代替 body 标签行使最外层滚动容器的权利，这里有很多种做法，可以查看 Demo 源码看一种简单的实现。

通常这种做法在禁用 Android Chrome 的自带的下拉刷新的时候非常常用，因为改动的代码非常少，并且相对于后面的 touchmove 的 preventDefault 方法也不影响页面自身的 touch 事件。基本算是 Android Chrome 自身自带的一个无污染的 hack 了。

### e.preventDefault()

还有一种很常见的方式，也是我们想禁用浏览器自带事件时候最容易想到的方法，就是对 touchmove 事件进行 `e.preventDefault()` 处理，这样，就能够把浏览器的默认事件给阻止掉。

结合前面提到的 Android Chrome 下拉刷新的触发条件，我们禁用浏览器默认的下拉刷新的思路是：

* 当 `scrollTop` 等于 0 的时候
* 并且判断是下拉手势，判断 derection 向下的

满足以上的逻辑的，都 preventDefault 掉，照着这个思路，我们应该很快就有代码产出出来了：

```js
var lastY = 0;

window.addEventListener('touchmove', function (e) {
    var scrolly = window.pageYOffset || window.scrollTop || 0;
    var direction = e.changedTouches[0].pageY > lastY ? 1 : -1;

    if (direction > 0 && scrolly === 0) {
        e.preventDefault();
    }
    lastY = e.changedTouches[0].pageY;
});
```

这段代码确实是能够解决问题的，但是在 Android Chrome v56 版本以后却无法达到我们的预期，并没有禁用掉下拉刷新。通过调研发现了个有趣的事情，Andorid Chrome 为了实现更快速的滚动效果，做了一些特殊的处理，这里有一些文档可以参考

* [https://developers.google.com/web/updates/2017/01/scrolling-intervention](https://developers.google.com/web/updates/2017/01/scrolling-intervention)
* [https://www.chromestatus.com/features/5093566007214080](https://www.chromestatus.com/features/5093566007214080)

简单点说，就是在 Chrome 56 版本之前，`addEventListener` 第三个参数有个默认的属性是 `{passive: false}`, 从 Chrome 56 版本之后，默认的属性就变成了 `{passive: true}` 了，改了这个有什么影响呢？这个属性会让 touch 事件的 `e.preventDefault()` 方法全部失效，这就难怪我们之前的代码在 Chrome 56 之后就不好使了。

所以我们需要对我们的代码进行一些改动：

```js
window.addEventListener('touchmove', function (e) {
    // ... 省略代码了
}, {passive: false})
```

这样就能够使 `e.preventDefault()` 方法生效了，然后就可以实现禁用 Android Chrome 的下拉刷新的功能了，这里有一个 [preventDefault Demo](https://zoumiaojiang.win/demo/chrome/disable-pull-refresh-by-prevent-event-default.html)。

### 设置浏览器

其实这个方法禁用浏览器下拉刷新就有点扯淡了，因为这个需要用户自己设置浏览器，之前的方法都是开发者来完成的，对用户来说是透明的。但还是提一嘴这个方法，毕竟 Chrome 提供了这种方式。

* 第一步：浏览器输入 `chrome://flags`
* 第二步：找到 `disable-pull-to-refresh-effect`
* 第三步：点 `停用` 就 ok 了

这种方式 Lavas App 导出的 App 就不会考虑了，因为我们希望这些禁用和不禁用的选择权由开发者来完成，而保持对用户的透明。

## 写在后面

这里还是要说明一下，iOS 下的 Chrome 我没有深入测试，这里不好深入探讨（后面做了详细的调研之后再会补充）。顺便感叹一下 Chrome 真是太努力了，在牛逼的道路上已经越走越远了，每个版本都有一些有意思很实用的东西，只是希望其他浏览器厂商也跟进起来。

最后，看起来实现一个下拉刷新的功能还真挺麻烦的，不光是要考虑刷新功能本身的实现问题，还需要考虑到开发者禁用的情况。
Lavas App 导出的 App 争取和 Android Chrome 在体验和网页开发上保持一致。

## 参考资料

本文参考了一些文章，大家可以深入阅读，深入探索

* https://docs.google.com/document/d/12Ay4s3NWake8Qd6xQeGiYimGJ_gCe0UMDZKwP9Ni4m8
* https://stackoverflow.com/questions/36212722/how-to-prevent-pull-down-to-refresh-of-mobile-chrome
* https://www.w3.org/TR/touch-events/#dfn-preventdefault
* https://www.chromestatus.com/features/5093566007214080
* https://developers.google.com/web/updates/2017/01/scrolling-intervention
