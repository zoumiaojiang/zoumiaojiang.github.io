/**
 * @file mip serviceworker processor
 * @author mj(zoumiaojiang@gmail.com)
 */

/* global self, caches, fetch */

const CACHE_NAME = 'mip-sw-static-cache'

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if ([CACHE_NAME].includes(key)) {
            return caches.delete(key)
          }
        })
      )
    }).then(function () {
      return self.clients.matchAll()
        .then(function (clients) {
          clients && clients.length && clients.forEach(function (client) {
            client.postMessage('sw.update')
          })
        })
    })
  )
})

self.addEventListener('fetch', function (event) {
  let url = new URL(event.request.url)
  let netLevel = 0
  let connection = navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection ||
    navigator.msConnection
  // 只是缓存 mip 核心和 mip 官方组件
  let matchReg = /https:\/\/c\.mipcdn\.com\/.*\.(js|css)/

  if (connection) {
    if (connection.effectiveType) {
      netLevel = connection.effectiveType.toUpperCase() === '4G' ? 0 : 1
    } else if (connection.type) {
      netLevel = connection.type.toUpperCase() === 'WIFI' ? 0 : 1
    }
  }
  // 弱网情况下才引入 service worker fetch 代理
  if (netLevel > 0 && matchReg.test(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(event.request).then(function (response) {
          return response || fetch(event.request).then(function (response) {
            cache.put(event.request, response.clone())
            return response
          })
        })
      })
    )
  }
})
