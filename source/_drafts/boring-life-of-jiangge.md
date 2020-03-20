---
title: 无聊透顶的江哥
subtitle: 随笔讲讲 JS 相关有意思的事情
catalog: true
header-img: ./boring.jpg
tags:
  - JavaScript
  - 吐槽
  - 杂谈
categories:
  - Coding
date: 2018-01-25 00:59:44
---

> 本文纯属扯淡，想到哪讲到哪，借助江哥的故事，讲一些 JS OOP 的基础知识以及 JS 的执行原理，本文多以代码为主，慎读。

今天突然很无聊，给大家讲一个故事，从前有个人叫江哥，是个程序猿，他的一生注定是很无聊的，因为他每天只干三件事，吃饭，睡觉，写代码。江哥也很笨，他每次只能处理一件事情，吃完了饭才能去睡觉，睡醒了才能写代码，然后不出意外的话就这么周而复始，穷尽一生。有一天江哥的脑洞突然开了一下，他想如果用一段 JS 代码来形容的话，基本上以下代码就可以概括他的日常生活了：

```js
let jiangGe = new Programmer();

jiangGe.eat('breakfast');
jiangGe.coding('bug');
jiangGe.eat('lunch');
jiangGe.sleep(20 * 60);
jiangGe.coding('bug');
jiangGe.eat('dinner');
jiangGe.coding('bug');
jianfGe.sleep(6 * 60 * 60);

// eat breakfast
// coding bug
// eat lunch
// 午休，等 20 分钟后
// coding bug
// eat dinner
// coding bug
// 睡觉，等 6 个小时
```

> 突然兴起，今天就用 JS 代码来讲讲江哥无聊的一生吧。

## JS 类

江哥或者说大部分程序猿如果用 JS 代码来表示大概内部是怎么实现的呢？程序猿肯定是一类差不多的人，都差不多的无聊，基本上都能吃饭，睡觉，敲代码，所以我们把程序猿归为一个类，下面用 ES6 的语法实现以下程序猿这个类。

```js
class Programmer {
    eat(sth) {
        console.log(`eat ${sth} `);
    }

    sleep(second) {
        let sleepTo = (Date.now() + second * 1000);

        // 睡觉的时候完全阻塞进程，等着吧您呢，睡着了啥也干不了
        while (sleepTo - Date.now() > 0) {}
    }

    coding(lang) {
        console.log(`code ${lang} `);
    }
}
```

## 链式调用

其实有很多时候江哥觉得自己风度翩翩、风流倜傥、才华横溢，怎么能和普通程序猿一样呢，所以他决定要改变一下吃饭、睡觉、敲代码的姿势，通过深思熟虑后，江哥将自己的 API 改成如下姿势：

```js
let jiangGe = new SuperProgrammer();

jiangGe.eat('breakfast')
    .coding('bug')
    .eat('lunch')
    .sleep(20 * 60)
    .coding('bug')
    .eat('dinner')
    .coding('bug')
    .sleep(6 * 60 * 60);
```

果然潇洒帅气了好多，很明显这是个链式调用，隐约中透露出了咄咄逼人的气质，可是链式调用怎么实现呢？该怎么做才能满足江哥的需求？链式 API 的设计通常都是在调用对象方法之后返回对象本身，那我们需要设计一下改变自己个后江哥所处的新圈子（类）- `SuperProgrammer` 了，具体设计如下：

```js
class SuperProgrammer {
    eat(sth) {
        console.log(`eat ${sth} `);
        return this;
    }

    sleep(second) {
        let sleepTo = (Date.now() + second * 1000);
        while (sleepTo - Date.now() > 0) {}
        return this;
    }

    coding(lang) {
        console.log(`code ${lang} `);
        return this;
    }
}
```

这样的话，每个 SuperProgrammer 对象（一个个像江哥这样风度翩翩的程序猿）都能够通过调用自己的方法，返回对象本身，然后又可以去调用对象的其他方法，江哥瞬间感觉到无聊的人生有了一点点升华。

## 无 new 对象

好景不长，江哥思来想去，还是不满意，他觉得自己应该是唯一的，虽然自己只是每天吃饭、睡觉、敲代码，但那也不应该是程序猿那茫茫众生中平凡的一份子，江哥想要的是独一无二的，他不要是某一类人，他就是他自己：

```js
JiangGe().eat('breakfast')
    .coding('bug')
    .eat('lunch')
    .sleep(20 * 60)
    .coding('bug')
    .eat('dinner')
    .coding('bug')
    .sleep(6 * 60 * 60);
```

从代码看，很明显，江哥不想从某一类人里面被 `new` 出来，那江哥就只能是一个孤独的对象了，但是 JiangGe 又必须是个函数，因为它还必须可被调用 `JiangGe()`，嗯，需要好好想想办法了，想来想去还是让 JiangGe 变成一个函数吧，然后函数的返回值直接是一个对象，这样就实现了一个单例，而这个单例对象就是独一无二的江哥。

```js
function JiangGe() {
    return {
        eat(sth) {
            console.log(`eat ${sth} `);
            return this;
        },

        sleep(second) {
            let sleepTo = (Date.now() + second * 1000);
            while (sleepTo - Date.now() > 0) {}
            return this;
        },

        coding(lang) {
            console.log(`code ${lang} `);
            return this;
        }
    };
}

```

> 之前的 `class` 关键字的例子都是基于 ES6 的语法，当然也可以使用构造函数来实现，在这里我就不详细介绍构造函数和 prototype 等相关的内容了，大家可以自行了解一下。

## setTimeout

江哥得瑟了几天之后又不爽了，因为在他睡着的时候，没有人能叫醒他，他也不能做梦，总之就是睡着了整个人就完全像挂掉了一样，这样江哥还是很惶恐的。

这种情况是因为 `while` 循环在 JS 单线程执行过程中会完全阻塞线程，只有等 `while` 执行完成，才能做其他的操作。我们脑子里面马上想到异步的 `setTimeout` 好像可以帮助我们来实现江哥睡觉的行为。

```js
function JiangGe() {
    return {
        eat(sth) {
            console.log(`eat ${sth} `);
            return this;
        },

        sleep(second) {
            setTimeout(() => console.log('weakup'), second * 1000);
            return this;
        },

        coding(lang) {
            console.log(`code ${lang} `);
            return this;
        }
    };
}

JiangGe()
    .eat('breakfast')
    .sleep(5)
    .coding('bug');

// 可是执行出来的结果却是：
// eat breakfast code bug
// 过五秒钟后
// weakup
```

我们发现这种实现方式并没有满足江哥的预期。其实是因为我们对 `setTimeout` 的原理理解的有点偏差，`setTimeout` 虽然能够达到延后执行「睡觉」的效果，但是它是独立于 JS 主线程异步执行的（`setInterval` 也是一样的）。

可以这么来理解一下，当你的代码中，如果 JS 主线程执行到含有 `setTimeout` 方法的地方，JS 引擎会将 `setTimeout` 的执行单元丢到一个独立的执行任务队列中，然后继续向下执行 JS 主线程的内容，直到 JS 主线程任务全部执行完毕后，才去执行任务队列中的 `setTimeout` 方法。可以看一下下面的例子：

```js
let begin = Date.now();

setTimeout(() => console.log('bingo!'), 3000);

// ... 这里还有一些 JS 代码被省略
while(Date.now() - begin <= 2000) {}

// 这个时候，应该是是 5s 多一点的时间才会打印出 `bingo!`
```

## 队列设计

貌似陷入僵局了，如果使用异步的 `setTimeout` 来实现 sleep，确实不会造成 JS 主线程阻塞，但是却完全打乱了顺序，达不到江哥的预期。

我们可以换一个思路，如果在执行链式操作的时候，并不马上执行，而是我们仿照 JS 主线程建立一个自己的执行队列，用这样的方式来将链式调用实际上移到 JS 主线程任务都执行完了之后再执行。可以看一下下面的代码：

```js
function JiangGe() {
    let queue = [];

    let preObj = {
        eat(sth) {
            console.log(`eat ${sth} `);
        },

        coding(lang) {
            console.log(`code ${lang} `);
        }
    }

    // 执行自定义模拟队列的
    function exec(q) {
        if (q.length >= 0) {
            for (let i = 0, len = q.length; i < len; i++) {
                let item = q[i];

                if (item.name === 'sleep') {
                    setTimeout(() => exec(q.slice(i + 1)), item.second * 1000);
                    break;
                }
                else {
                    preObj[item.name].apply(this, item.args);
                }
            };
        }
    }

    let obj = {
        eat() {
            queue.push({
                name: 'eat',
                args: Array.prototype.slice.call(arguments)
            });
            return this;
        },

        sleep(second) {
            queue.push({name: 'sleep', second})
            return this;
        },

        coding() {
            queue.push({
                name: 'coding',
                args: Array.prototype.slice.call(arguments)
            });
            return this;
        }
    };

    // JS 主线程执行完之后，再执行我们的自定义队列
    setTimeout(() => exec(queue), 0);

    return obj;
}
```

好吧，也许还有更好的办法满足江哥的需求，但是就先这样吧，有了这个我们自己设计的队列之后，江哥想怎么睡怎么睡，真的好无聊。。。

## 参考文章

- [https://johnresig.com/blog/how-javascript-timers-work/](https://johnresig.com/blog/how-javascript-timers-work/)
