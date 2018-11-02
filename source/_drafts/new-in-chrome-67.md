---
title: Chrome 65 的新鲜货
catalog: true
header-img: ../new-in-chrome-61/chrome.jpg
tags:
  - Chrome
categories:
  - Chrome
date: 2018-03-15 00:20:00
subtitle:
---

## 新特性

- CSS Paint API: 允许您以编程方式生成图像。
- Server Timing API：允许 Web 服务器通过 HTTP 头提供性能计时信息。
- 新的 CSS display 属性值：内容属性可以使框消失。

### CSS Paint API

CSS Paint API(也叫 `CSS Custom Paint` 或者 `Houdini’s paint worklet`) 允许你通过编程的方式使用 CSS 属性生成一个图像，比如 `background-image` 或者 `border-image`。
你可以使用新的绘图函数来绘制图像，而不是通过引用图像，哈哈，这很像一个画布元素。

上代码：

```html
<!-- index.html -->
<!doctype html>
<style>
    textarea {
        background-image: paint(checkerboard);
    }
</style>
<textarea></textarea>
<script>
    CSS.paintWorklet.addModule('checkerboard.js');
</script>
```

我们定义一个叫 CheckerboardPainter 画布工作台(Paint worklet)，我们需要使用 `CSS.paintWorklet.addModule('my-paint-worklet.js')` 加载一个 CSS Paint worklet 文件，在那个文件中，我们可以使用 `registerPaint` 函数来注册一个 Paint workelet 类:

```js
// checkerboard.js
class CheckerboardPainter {
    paint(ctx, geom, properties) {
        // 在这里 ctx 对象就像是在正常的 canvas 里面使用 ctx 一样
        const colors = ['red', 'green', 'blue'];
        const size = 32;
        for(let y = 0; y < geom.height/size; y++) {
            for(let x = 0; x < geom.width/size; x++) {
                const color = colors[(x + y) % colors.length];
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.rect(x * size, y * size, size, size);
                ctx.fill();
            }
        }
    }
}

// 指定一个名称注册 class
registerPaint('checkerboard', CheckerboardPainter);
```

看看这个线上的 DOME 体验一下：https://googlechromelabs.github.io/houdini-samples/paint-worklet/checkerboard/

> 注意：CSS Paint API 只能在 HTTPS 环境或者 localhost 环境下使用。

#### 参数化

Paint worklet 还可以访问其他 CSS 属性，这是 paint workelet 附加参数属性起的作用啦，通过为该类提供静态 `inputProperties` 属性，你可以订阅对任何 CSS 属性，包括自定义属性，并这些值将通过属性参数提供给你。

```html
<!-- index.html -->
<!doctype html>
<style>
    textarea {
        /* paint worklet 关联这些自定义属性的更改 */
        --checkerboard-spacing: 10;
        --checkerboard-size: 32;
        background-image: paint(checkerboard);
    }
</style>
<textarea></textarea>
<script>
    CSS.paintWorklet.addModule('checkerboard.js');
</script>
```

```js
// checkerboard.js
class CheckerboardPainter {
    // inputProperties 返回此绘画函数可以访问的 CSS 属性列表（预定义）
    static get inputProperties() {
        return ['--checkerboard-spacing', '--checkerboard-size'];
    }
    paint(ctx, geom, properties) {
        // 在这里就可以直接通过 properties.get 取值啦
        const size = parseInt(properties.get('--checkerboard-size').toString());
        const spacing = parseInt(properties.get('--checkerboard-spacing').toString());
        const colors = ['red', 'green', 'blue'];
        for(let y = 0; y < geom.height/size; y++) {
            for(let x = 0; x < geom.width/size; x++) {
                ctx.fillStyle = colors[(x + y) % colors.length];
                ctx.beginPath();
                ctx.rect(x*(size + spacing), y*(size + spacing), size, size);
                ctx.fill();
            }
        }
    }
}

registerPaint('checkerboard', CheckerboardPainter);
```

#### HACK

如果当前浏览器不支持 CSS Paint API 该如何处理呢？首先可以看一下当前主流浏览器的支持情况： https://ishoudinireadyyet.com/

为了达到渐进式的体验，在支持该 API 的浏览器上能够生效，在不支持的浏览器上也能有替代方案，为了做这个 HACK，需要做两个地方的适配，分别是 CSS 代码和 JS 代码：

在 CSS 文件里，有两种方案，第一种是可以使用 `@supports`

```css
@supports (background: paint(id)) {
    /* ... */
}
```

或者是使用 CSS 嗅探原理：

```css
textarea {
    background-image: linear-gradient(0, red, blue);
    background-image: paint(myGradient, red, blue);
}
```

在 JS 代码中，只需要通过嗅探机制，判断 API 是否存在即可：

```js
if ('paintWorklet' in CSS) {
    CSS.paintWorklet.addModule('mystuff.js');
}
```

有了 CSS Paint API，其实我们的脑洞可以不妨开的更大点，还有很多好玩的东西可以探索，具体可以了解 https://developers.google.com/web/updates/2018/01/paintapi

### Server Timing API

您使用导航和资源计时 API 来跟踪真实用户的网站性能现在有戏了。以前，服务器还没有一个简单的方法来报告其性能时序。
Server Timing API 允许服务器将时间信息传递给浏览器，让你更好地了解整体表现。

您可以根据需要追踪任意指定的服务器指标：数据库读取时间，启动时间或对你来说重要的任何内容，方法就是是在请求的响应头(Response Header) 中添加 `Server-Timing` 值：

```shell
'Server-Timing': 'su=42;"Start-up",db-read=142;"Database Read"'
```

它们会显示在 Chrome DevTools 中，或者您可以将它们从响应头中提取出来，然后将其保存在其他性能分析中。
![nic65-server-timing-devtools](./nic65-server-timing-devtools.png)

### display: contents

## 参考文章

- https://developers.google.com/web/updates/2018/03/nic65
- https://developers.google.com/web/updates/2016/05/houdini
- https://developers.google.com/web/updates/2018/01/paintapi
- https://w3c.github.io/server-timing/