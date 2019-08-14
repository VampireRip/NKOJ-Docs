安装 pm2：

```bash
npm i pm2 -g
pm2 startup
```

创建一个 `ecosystem.config.js`，大概这样子：

```javascript
module.exports = {
  apps : [{
    name: 'API',
    script: 'bin/www',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'development',
      GITHUB_WEBHOOK_SECRET: '<什么奇怪的东西>'
    },
  }],
}
```

然后就可以用 `pm2 start ecosystem.config.js` 啦。

不过还需要 `pm2 save` 来把它们保存下来。
