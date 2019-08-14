Vampire 本身是个不怎么需要 Test 的前端项目。虽然有些前端项目也确实需要各种各样的测试，不过相比后端来讲，前端测试可以说是非常非常非常麻烦了。不同的浏览器，不同的版本，不同的分辨率。。超级头痛。。所以我们先从后端测试开始入门吧。

看了很多的测试框架，大多数都是以 [`mocha`](https://mochajs.org/) 为基础的。所以直接试试用 `mocha`，不好用再换嘛。

`assert` 我想采用 [`chai`](https://www.chaijs.com/) 的 expect 风格。感觉蛮有趣的，不好用再换>.<

所以，开始就是这个样子啦：

```bash
npm i mocha chai -D
```

在根目录的 `/test` 文件夹创建 `index.js` 作为我们的测试入口点。

在 `package.json` 加入

```json
"scripts": {
  "test": "mocha ./test"
},
```

测试一下看看好不好用0v0

```bash
npm run test
```

应该能够正确显示 `0 passing (0ms)`，不错哦，说明我们配置正确啦。

继续让我们的 eslint 能够和它愉快地合作，在 `test/index.js` 的顶端加上

```js
/* eslint-env node, mocha */
```

酱紫 eslint 就能够认出我们的 `describe` 和 `it` 什么的啦。

最终我们的 `index.js` 会变成这个样子：

```js
/* eslint-env node, mocha */

const { expect } = require('chai');

describe('Hello', () => {
  it('should work with chai', () => {
    expect(0).to.equal(0);
  });
});
```

试试 `npm run test`，如果能看到：

```bash
Hello
   ✓ should work with chai

 1 passing (0ms)
```

就说明我们的测试可以正确地工作啦~
