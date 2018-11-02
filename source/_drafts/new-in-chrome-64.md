---
title: Chrome 64 的新鲜货
catalog: true
header-img: ../new-in-chrome-61/chrome.jpg
tags:
  - Chrome
categories:
  - Chrome
date: 2018-02-05 00:20:00
subtitle:
---

Google Chrome 团队在 2018 年 1 月底发布了 V64 版本，由于最近比较忙，一直没来的及更新，Chrome 64 本次升级一如既往的带来了很多有意思的升级，接下来可以看一下。

## 新特性

Chrome 64 此次新增了以下新特性:

- 支持了 `ResizeObservers`。
- 模块现在可以通过 `import.meta` 访问主机特定的元数据。
- 强化了 `浏览器阻止弹窗` 功能。
- `window.alert()` 升级。

如果想要了解更细致的 chrome v64 改动点，这里有更详细的 ChangeLog: https://chromium.googlesource.com/chromium/src/+log/63.0.3239.84..64.0.3282.140

### 支持 `ResizeObservers`

以前如果需要追踪某个 DOM 元素的大小变化轨迹非常费劲，通常的做法就是监听 `document` 元素的 `resize` 事件，然后调用 DOM 的 `getBoundingClientRect` 或者 `getComputedStyle` 方法，无论怎么做整个过程都会难以避免的发生布局抖动。

还有一些情况是：如果浏览器的窗口大小并没有发生变化，但是在页面文档中新增一个新的 DOM 元素，或者将某一个 DOM 加上 `display: none` 属性会怎么样呢？这些变化又都会影响其他 DOM 元素的大小或者布局。

`ResizeObserver` 这个 API 会在任何一个 DOM 元素的大小发生变化的时候能够发出通知，并且在回调中返回 DOM 元素变化后的高度和宽度的值，这个过程很大程度上经过了优化，减少了布局抖动。当然，这个 API 使用起来非常简单：

```js
// 初始化一个 ResizeObserver 对象，传入一个回调函数作为参数给构造函数
const ro = new ResizeObserver(entries => {
  // entries 就是一个数组，数组的每一个记录对应着每个需要监听的 DOM
  // 每一项包含这些 DOM 的二维信息
  for (const entry of entries) {
    // 打印出来看看就知道 entry 都有啥信息啦
    const cr = entry.contentRect;
    console.log('Element:', entry.target);
    console.log(`Element size: ${cr.width}px × ${cr.height}px`);
    console.log(`Element padding: ${cr.top}px ; ${cr.left}px`);
  }
});

// 这里就可以使用 `ResizeObserver` 对象的 `observe` 方法监听你想要监听的任何 DOM 元素啦。
ro.observe(someElement);
```

还有很多细节和有趣的应用，有兴趣的可以阅读这个文档：https://developers.google.com/web/updates/2016/10/resizeobserver

### 强化阻止弹窗功能

当在一个页面里打开了一个弹框导航到另一个页面什么的，通常那些弹窗的导航页面不是广告页面就是一些你不想看到的乱七八糟的玩意，从 Chrome v64 版本开始，就会对这一类型的跳转进行拦截，Chrome 会通过展示一些原生的 UI 去让用户自己选择要不要允许这些跳转。

### import.meta

Chrome 在 v61 就支持了 JavaScript 模块，当你在写 JavaScript 模块的时候，你经常需要访问有关当前模块的主机特定元数据，现在 Chrome v64 支持了模块内的 `import.meta` 属性，并将该模块的 URL 作为 import.meta.url 公开，当您想要动态解析当前 HTML 文档所依赖性的模块文件的资源时，这非常有用。

### window.alert() 升级

`window.alert()` 不再将背景选项卡带到前台！ 相反，当用户切换回该选项卡时，将显示弹窗。

### 更多的升级

- Chrome 64 现在支持了正则表达式中的 `命名捕捉(Named Captures)` 和 `Unicode 属性转义(Unicode property escapes)`

**命名捕捉**

```js
const pattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/u;
const result = pattern.exec('2017-07-10');
// result.groups.year === '2017'
// result.groups.month === '07'
// result.groups.day === '10'
```

**Unicode 属性转义**

> 它们仅适用于由 `/u` 标志表示的识别 Unicode 的正则表达式

```js
/\p{Number}/u.test('①');      // true
/\p{Alphabetic}/u.test('雪');  // true
```

取反的话，可以使用 `\P` 匹配

```js
/\P{Number}/u.test('①');      // false
/\P{Alphabetic}/u.test('雪');  // false
```

Unicode 定义了更多方法来分类代码点，例如数学符号或日语平假名字符：

```js
/^\p{Math}+$/u.test('∛∞∉');                            // true
/^\p{Script_Extensions=Hiragana}+$/u.test('ひらがな');  // true
```

支持的 Unicode 属性类的完整列表可以在 [当前的规范提案](https://tc39.github.io/proposal-regexp-unicode-property-escapes/#sec-static-semantics-unicodematchproperty-p) 中找到，当然还有更多的 [例子](https://mathiasbynens.be/notes/es-unicode-property-escapes) 可供大家参考。

- `<audio>` 和 `<video>` 元素的默认 `preload` 值现在是元数据。 这使 Chrome 与其他浏览器一致，并且通过仅加载元数据而不是媒体本身来帮助减少带宽和资源的使用。

- 从 v64 版本开始可以在 Chrome 中使用 `Request.prototype.cache` API 去查看请求缓存的模式，并确定该请求是否为重新加载的请求。
- 可以使用焦点管理(Focus Management) API，你现在不需要通过 preventScroll 属性去将滚动条滚动到某个 DOM 元素就可以直接聚焦到它。

## DevTools 升级部分

Chrome v64 对 DevTools 这一次又有一些升级，主要包括以下几点：

- 性能监控：实时的查看一个页面的性能。
- 控制台侧边栏：减少控制台的干扰，专注于对你重要的调试信息。
- 组类似的控制台消息：控制台现在默认将类似的消息分组在一起。

### 性能监控

使用性能监控去获得页面加载或运行时性能各个方面的实时视图，包括以下信息：

- CPU 使用情况
- JavaScript 堆大小
- DOM 节点的总数量，JS 事件监听，页面中的文档(document)和帧(frame)
- 每秒重新计算布局和样式量

使用性能监控的步骤：

1、打开命令行菜单
2、输入 `Performance` 然后选择 `Show Performance Monitor`
3、然后就可以在界面里面查看性能信息了

### 控制台侧边栏

在大型网站上，控制台可能会迅速充满无关紧要的信息，使用新的控制台侧栏来减少无用信息的干扰，并专注于对你重要的消息和内容。

<img src="./console-sidebar.png" style="border:none;" alt="控制台侧边栏"/>

> 控制台侧边栏默认是关闭的，点击左上角的 `Show Console Sidebar` 图标去打开它。

### 组类似的控制台消息

控制台现在默认将类似的消息分组在一起。 例如，在下图中有 27 个消息实例 `[Violation] Avoid using document.write()`

<img src="group-similar.png" style="border:none;" alt="组类似的控制台消息"/>

点击一个组将其展开并查看消息的每个实例。

<img src="group-expanded.png" style="border:none;" alt="组类似的控制台消息展开"/>

> 当然，你也可以通过 `console.group()` 自定义自己的消息的分组。
