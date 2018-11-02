---
title: 如何优雅的维护 Service Worker
catalog: true
subtitle: 让 Service Worker 像你手里的风筝一样
header-img: ../how-regist-service-worker-for-pwa/service-worker.png
tags:
- PWA
- Service Worker
categories:
- PWA
---

继之前的一篇《[如何优雅的为 PWA 注册 Service Worker](https://zoumiaojiang.com/article/how-regist-service-worker-for-pwa/)》之后，今天再讲讲如何优雅的维护 Service Worker，很多开发者都认为 Service Worker 就像一头狮子，很难完全掌控它，尤其是上线之后，用户一安装，Web 站点的开发者感觉就像种地的农民一样，看天吃饭，祈求千万别出什么天灾人祸。事实上，Service Worker 设计的不好，的确很容易就产生不可思议，甚至不可挽回的问题，但是如果你很好的设计了 Service Worker 的话，这些问题都是可以规避的。

今天，就是要讲一下如何设计好你的 Service Worker 文件，先总结一下开发者的可能担忧的情况：

- 上线之后，发现 Service Worker 里有逻辑错误怎么办？
- 用户静态页面和缓存都缓存上了，怎么回滚？
- Service Worker 怎么更新的？会不会导致
