title: "Smarty For Javascript"
date: 2015-05-12 12:21:43
tags:
---

## 背景

> 我们为什么需要一个跑在javascript上的smarty模版引擎

### web开发模式变迁

很久以前，做一个项目如果后端采用的php语言架构的话，我们可能直接用`<?php xxx ?>`这种php标签去写逻辑，我们会把`<style>`, `<script>`都揉在一个php文件里，这种做法很随性，很自由，但有个最大的问题就是代码的耦合太强，不好维护，很快就被历史大浪淘沙掉了。

随着时间的推移，为了解决解藕以及高复用的问题，慢慢的就引入了久经考验的mvc开发模式，代表有thinkPHP, ci等框架， 这些php框架很好的解决了业务代码上的耦合，使得业务代码变的条理清晰，思路明确。

但是随着用户体验需求的不断增多，前端交互或者用户对产品的视觉效果要求越来越高的时候， 我们发现静态资源突然多了起来，我们的view层需要维护的东西越来越多，而且数据量也越来越大，同一份代码，很可能会有不同的人来维护， 这样的代码，这样的项目几乎是所有人都厌恶的东西。所以很快就有了模版的概念。

### smarty模版

模版是web开发变迁过程中总结出来的一种前后端分离解决方案的产物，我们为了避免不同的人都要操作同一份代码，就可以在view层中再细分出数据端和前端， 而这两端我们能够用模版来起到连接的作用。而smarty模版中的逻辑处理能力超强（虽然我个人不是很赞成在模版中操作复杂的逻辑，但是确实是相当方便的），语法也很语义话

```
    // data from php
    $username = 'admin';
```
```
    <!--smarty template-->
    <p>hello, {%$username%}</p>
```
```
    <!--html rendered by smarty with php data-->
    <p>hello, admin</p>
```

### ajax需求随处可见

我们试想一下有一个这样的需求：
> 一个列表页面， 有分页功能。这个需求应该比较常见吧。

我们假如页面是由smarty模版渲染出来的，那么我们面对这样的需求该怎么办呢？
目前常规的做法是， 我们在第一次加载这个页面的时候正常的使用smarty渲染出来， 当点击分页时， 我们发ajax向后端请求json数据， 然后通过json数据用js拼出一个列表页一模一样html的字符串（相当于一个前端的js模版），然后在ajax成功后，innerHTML替换掉列表页的内容。

orz.............

```
    <!--smarty template-->
    <table>
        <tr><td>Name</td><td>Age</td><td>From</td></tr>
        {%foreach $list as $item%}
        <tr>
            <td>{%$item.name%}</td>
            <td>{%$item.age%}</td>
            <td>{%$item.from%}</td>
        </tr>
        {%/foreach%}
    </table>
```
```javascript
    // js tempalte
    var html = ['<table>', '<tr><td>Name</td><td>Age</td><td>From</td></tr>'];
    for (var i = 0, l = list.length; i < l; i++) {
        var item = list[i];
        html.push(''
            + '<tr>'
            +     '<td>' + item.name + '</td>'
            +     '<td>' + item.age + '</td>'
            +     '<td>' + item.from + '</td>'
            + '</tr>'
        );
        html.push('</table>');
        listWapperDom.innderHTML = html.join('');
    }
```
从代码可以看出来，我们完成这样的一个ajax的需求，但是需要维护两个模版， 一个是smarty模版， 一个javascript模版。如果不是很复杂的模版道也无所谓， 但是如果列表页极其复杂，但是ajax之后的结果又几乎一致。我们该怎么办呢？如果我们有需求变更的时候，需要同时改变两个模版，这样麻烦不说，还可能会漏掉js的模版没改。 