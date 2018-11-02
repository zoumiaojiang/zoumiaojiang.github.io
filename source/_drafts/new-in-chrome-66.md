---
title: Chrome 66 的新鲜货
catalog: true
header-img: ../new-in-chrome-61/chrome.jpg
tags:
  - Chrome
categories:
  - Chrome
date: 2018-04-19 00:20:00
subtitle:
---

Chrome 66 版本发布啦，同样的，我来记录下到底在这个版本有哪些变化。

## 新特性

- 通过 CSS Typed Model Object 更方便的操作 CSS
- 异步的访问粘贴板
- Canvas 提供了一种新的渲染 context
- AudioWorklet

### CSS 分类对象模型（CSS Typed Object Model）

你肯定用 JavaScript 操作过 CSS 属性，那你就使用过 CSS 对象模型，当时 CSS 对象模型的返回值总是字符串类型：

```js
el.style.opacity = 0.3;
console.log(typeof el.style.opacity);
> 'string' // 字符串!?
```

但是有的时候，如果想要通过去操作 opcity 属性去实现一个动画的效果，那你必须要求将这个字符串的结果转成数字，这样你才能去 ++ 这个值去改变 CSS 属性值，因为字符串是不能直接 ++ 的。

```js
function step(timestamp) {
  const currentOpacity = parseFloat(el.style.opacity);
  const newOpacity = currentOpacity + 0.01;
  element.style.opacity = newOpacity;
  if (newOpacity <= 1) {
    window.requestAnimationFrame(step);
  }
}
```

那在 Chrome 66 及以后的版本中，CSS 的属性值就会在 CSS 强类型对象模型（CSS Typed Object Model）中以带有类型的 JavaScript 对象暴露出来，这样就可以消除了许多类型操作，并提供了一种更加健全的 CSS 操作方式。

除了使用 `element.style` 这种方式以外，你还可以通过 `.attrbuteStyleMap` 属性或者 `.styleMap` 属性的方式获取样式值，然后这两个属性都会返回一个容易读取和修改的类似于 Map 的对象。

```js
el.attributeStyleMap.set('opacity', 0.3);
const oType = typeof el.attributeStyleMap.get('opacity').value;
console.log(oType);
> 'number' // 是数字!
```

有个非常有意思的结论：和老的 CSS 对象模型比起来，早期基准测试显示，每秒操作的速度提高了 30％，这对 JavaScript 动画来说特别重要。

```js
el.attributeStyleMap.set('opacity', 0.3);
el.attributeStyleMap.has('opacity'); // true
el.attributeStyleMap.delete('opacity');
el.attributeStyleMap.clear(); // 删除所有的 CSS 属性和值
```

当然，它还有助于消除由于忘记将值从字符串转换为数字而引起的错误，并且它会自动处理值的舍入和限制（这点考虑的很人性化）。 另外，还有一些优雅的处理单位转换、算术和平等的新方法。

```js
el.style.opacity = 3;
const opacity = el.computedStyleMap().get('opacity').value;
console.log(opacity);
> 1
```

这里有篇详细的文章介绍 [CSSTOM 以及一些很有趣的例子](https://developers.google.com/web/updates/2018/03/cssom)。

### 异步的剪贴板 API (Async Clipboard API)

```js
const successful = document.execCommand('copy');
```

使用 `document.execCommand` 同步复制和粘贴对于小部分文本还 ok，但在很多情况下，很可能它的同步性质会阻塞页面进程，从而导致用户体验不佳。还有更坑的是，浏览器之间的权限模式也不一致，很难做出良好的复制粘贴体验。

Chrome 66 提供的新的异步剪贴板 API 是一种复制粘贴的异步方案，并与权限 API 集成，为用户提供更好的体验。

通过调用 `writeText()` 方法，文本会被复制到剪贴版。

```js
navigator.clipboard.writeText('复制我!')
  .then(() => {
    console.log('内容已经被复制到剪贴版！');
  }).catch(err => {
    // 如果用户不授权剪贴版 API 的话会进入这里
    console.error('不能粘贴内容: ', err);
  });
```

既然是 Promise 接口，那也可以通过 `async/await` 的方式去使用：

```js
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('内容被复制成功');
  } catch (err) {
    console.error('复制失败: ', err);
  }
}
```

由于这个 API 是异步的，`writeText()` 方法返回一个 Promise，根据我们传递的文本是否成功复制的情况，Promise 会决定 resolve 复制的内容，还是直接 reject。同样，可以通过调用 `readText()` 方法从剪贴板中读取文本，并等待返回的 Promise 与文本一起解析。

```js
navigator.clipboard.readText()
  .then(text => {
    console.log('剪贴板内容: ', text);
  }).catch(err => {
    console.error('粘贴失败: ', err);
  });
```

同样的，如果是 `async/await` 应该怎么使用呢？

```js
async function getClipboardContents() {
  try {
    const text = await navigator.clipboard.readText();
    console.log('粘贴的内容: ', text);
  } catch (err) {
    console.error('粘贴失败: ', err);
  }
}
```

还可以通过监听 `paste` 事件来获取当前复制粘贴的内容是什么，后面的 API 实现中，也有可能会有其他的事件可以被监听：

```js
document.addEventListener('paste', event => {
  event.preventDefault();
  navigator.clipboard.readText().then(text => {
    console.log('粘贴的内容: ', text);
  });
});
```

Chrome 的文档中还列出了很多关于 Clipboard API 的 [Demo](https://developers.google.com/web/updates/2018/03/clipboardapi)。

### 新的 Canvas Context -- BitmapRenderer

Canvas 元素可让您在像素级操作图形，你可以绘制图形，处理照片，甚至可以进行实时视频处理。 但是，除非你以空白画布开始，否则你就需要有一种方法在画布上呈现图像。 历史原因，你需要要先创建一个图片标签，然后将其内容呈现在画布上，那这就意味着浏览器需要将图像的多个副本存储在内存中。

```js
const context = el.getContext('2d');
const img = new Image();
img.onload = function () {
  context.drawImage(img, 0, 0);
}
img.src = 'llama.png';
```

好消息是，从 Chrome 66 开始，有一个新的异步渲染 Context 简化了 ImageBitmap 对象的显示。 他们现在可以进行异步操作，并且可以避免内存重复从而提高效率和减少工作量。你可以这么的去使用 ImageBitmap:

- 1、调用 `createImageBitmap` 方法，并且给它传一个图像 blob，用来创建这个图像
- 2、从画布中获取 bitmaprenderer context（不再是 2d/3d context 啦）
- 3、然后通过 context 的 `transferFromImageBitmap` 方法传输图像到画布

```js
const image = await createImageBitmap(imageBlob);
const context = el.getContext('bitmaprenderer');
context.transferFromImageBitmap(image);
```

同样的结果，可以将一张图画到 Canvas 上，但是却比高效很多。

### AudioWorklet

Chrome 65 的时候，引入了 `PaintWorklet`，现在在 Chrome 66 中，默认的引入了另一种 Worklet -- AudioWorklet，这种新型的 Worklet 可用于处理专用音频线程中的音频，取代在主线程上运行的传统 ScriptProcessorNode。 每个 AudioWorklet 都在其 global 作用域范围内运行，减少了延迟并提高了吞吐量稳定性。

Google 在 [Chrome 实验室](https://googlechromelabs.github.io/web-audio-samples/audio-worklet/) 中提供了很多 AudioWorklet 的例子，有兴趣可以深入的体验一下。

### 其他新特性

- `TextArea` 和 `Select` 标签在现在支持了 `autocomplete` 属性
- 在表单元素上设置 `autocapitalize` 将应用于任何子表单域(fields)，从而提高与 Safari 的 `autocapitalize` 实现的兼容性
- `trimStart()` 和 `trimEnd()` 现在可用作基于标准的修剪字符串空白的方式。

## DevTools 升级部分

- Network 面板的黑盒
- 在设备模式下自动调整缩放
- 在 Preview 和 Response 标签中进行优雅的打印
- 在 Preview 标签下预览 HTML 内容
- 本地在 HTML 中重写样式

## 参考文章

- https://developers.google.com/web/updates/2018/04/nic66
- https://developers.google.com/web/updates/2018/03/cssom
- https://developers.google.com/web/updates/2018/03/clipboardapi
