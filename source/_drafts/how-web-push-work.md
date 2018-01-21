---
title: Web Push 机制是如何工作的
catalog: true
subtitle: 给你的 Web 站点的带来可观的用户粘性
header-img: notification.jpg
tags:
- PWA
- Service Worker
- Web Push
categories:
- PWA

---

Web Push 是 PWA 的一个重要的特性，今天在这里讲解一下在 Web 站点中是如何借助 Web Push 和 Notification API 来做到消息订阅以及消息推送的。首先可以先通过下图了解一下 Web Push 和 Notification 都是怎么协作的。

<a href="./webpush.png" target="_blank"><img src="./webpush.png" style="border:none;" alt="web push 和 notification 的流程状态图"/></a>

> Push Service 给置灰了，主要是因为服务部署在国外，在国内用不了，为啥用不了？这个问题我的智商回答不了。为啥不在国内搞一个 Push Service 呢？只能说国内还没有像 Google 这种有魄力的机构来支持标准，就算有，考虑到 Push Service 必须参照标准实现，必须要透传所有消息，那就有人可能恶意的推小黄图给用户并且无法被管制，这在国内也不是很和谐吧，b不管怎样还是先了解一下吧。

这篇文章就从四个方面尽量通俗易懂的介绍一下 Web Push 机制是如何工作的，「注册 Push Service」、「订阅消息」、「推送消息」、「展现消息」。

## 注册 Push Service

## 订阅消息

## 推送消息

## 展现消息