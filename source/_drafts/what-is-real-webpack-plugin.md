---
title: 有必要花点时间的 Webpack Plugin
catalog: true
subtitle:
header-img: 
tags:
- webpack
- 构建
- 工程化
categories:
- 工程化
---

## 什么是 Webpack?

什么是 Webpack？ Webpack 能干什么？ Webpack 怎么用？ 太多的入门教程了，一搜一大把，不打算再说了，而且 Webpack 的文档应该是文档届的标杆了，太详细了，由浅入深，从初级玩具 Level，到深度优化的真实产品级别的高级 Level 都讲的特别细致易懂，在这里就不细说了，丢一个 [Webpack 的文档链接吧](https://webpack.js.org)。

等把入门的教程了解完之后，现在的问题是：“什么是 Webpack 插件？”

> Webpack 插件是 Webpack 的骨架，Webpack 本身也是利用这套插件机制构建出来的。

感觉比较拗口，这个就得从 Webpack 的 [源码](https://github.com/webpack/webpack) 看 Webpack 的具体实现才能解释的清楚了，我们暂时可以理解为 Webpack 的核心是一个编译器（Compiler），而这个编译器也是作为一个插件提供给 Webpack 的。那 Webpack 是如何实现的？Webpack 插件是什么？Webpack 插件机制又是什么？什么又是 Webpack 编译器？

在这里可以先回答一下 Webpack 插件是什么？剩下的些问题得等我们进行后面的源码解析才能得到答案了。如下面代码描述，`some-webpack-plugin` 就是一个 Webpack 插件。

```js
const webpack = require('webpack');

// 假设有这么一个 webpack plugin
const SomeWebpackPlugin = require('some-webpack-plugin');

webpack({
    // ...
    plugins: [
        new SomeWebpackPlugin({/* some plugin options */})
    ]
    // ...
});
```

我通俗的理解为，Webpack 插件是一个编译单元。作为 Webpack 的编译流程中的一个只负责某项功能的小的单元。

## Webpack 插件的内部实现

## Webpack 插件运行机制

## Webpack 编译器

## Webpack 插件有什么门道

## 自己写一个 Webpack 插件

## 写更好的 Webpack 插件
