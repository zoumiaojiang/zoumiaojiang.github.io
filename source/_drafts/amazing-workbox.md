---
title: 神奇的 Workbox
catalog: true
subtitle: 让你的 Web 站点轻松做到离线可访问
header-img: workbox.jpg
tags:
- Service Worker
- PWA
categories:
- PWA
---

[Workbox](https://github.com/GoogleChrome/workbox) 是 GoogleChrome 团队推出的一套 Web App 静态资源本地存储的解决方案，该解决方案包含一些 Js 库和构建工具，在 Chrome Submit 2017 上首次隆重面世。而在这个神奇的 Workbox 背后则是 [Service Worker]() 和 [Cache API]() 相关技术在驱动。在 Workebox 之前，GoogleChrome 团队较早时间推出过 [sw-precache]() 和 [sw-toolbox]() 库，但是在 GoogleChrome 工程师们看来，此次发布的 Workbox 才是真正能方便统一的处理离线能力的更完美的方案，所以停止了对 sw-precache 和 sw-toolbox 的维护。从 sw-precache 和 sw-toolbox 的相关 issue 来看，众多开发者对它们也是颇有怨言。

## 概述

先了解一下 Workbox：

- 不管你的站点是何种方式构建的，都可以为你的站点提供离线访问能力。
- 就算你不考虑离线能力，也能让你的站点访问速度更加快。
- 几乎不用考虑太多的具体实现，只用做一些配置。
- 简单却不失灵活，可以完全自定义相关需求（支持 Service Worker 相关的特性如 Web Push, Background sync 等）

bingo！ 如果你被这些特性吸引住了，可以往下看看。

## 用法

### Webpack

### Gulp

### CLI

## 实现原理

## 缓存策略

## 扩展

## Debug

## 你要用吗？
