**Service Worker** 嘛，顾名思义，就是 **服务工作线程** 啦（微软的 Edge 浏览器把
*bypass service worker* 翻译成了 *旁路服务工作人员*，真是天才），
虽然目前还在草案阶段，不过大多数浏览器都已经支持它啦，各大网站也都有在使用。

服务工作线程的作用超多！它可以脱离正常页面加载流程，在任何时间节点上访问网络，
并劫持客户端的联网请求，返回任意内容，因此，只有想不到，没有做不到的说。

比如，有些 HTML5 App 会希望当用户打开页面时预先下载之后需要用到的图片、小视频，
这样，当用户当切换路由时图片和小视频已经预先下载好了，也就不会看到一段时间的白屏，
用户感受不到等待时间，提升了展示页面的体验。

再比如，新浪微博、推特使用这项技术进行后台下载消息并与客户端同步。Service Worker
保持一个长连接，当有新的微博或推特时，就可以通知客户端刷新或者更新 DOM。
它也可以实现显示通知的功能，Chrome 的 `xxx 网站想要显示通知` 就是 Service Worker
在作怪啦。同时，由于哪怕客户端关闭它也可以继续存在并保持信息，
也可以很容易地实现诸如离线发送微博、推特这样子的功能。

而对于一些不经常更新的网站，服务工作线程的作用就是 **保持页面缓存供离线使用** 啦。试试
[VuePress](https://vuepress.vuejs.org/zh/)，是不是打开过一次之后，哪怕是不联网，
也可以正常的访问它呢？它用了谷歌的非常厉害的技术
[WorkBox](https://developers.google.com/web/tools/workbox/guides/generate-service-worker/webpack)，
我们的 Vampire.rip 也可以离线访问哦？试试看~ （我写了十多天才写出来！居然谷歌有现成的解决方案嘛！难过！）

不过我的实现和谷歌的实现还是不相同的啦，各自有各自的特点，比如，为了实现离线访问，
谷歌的 sw 不得不重复下载一遍整个网站，也不得不需要事先知道各个文件及其修正版本，
而我的实现就不用（但是不得不在首次页面加载时等上一段时间）！

总之，有很多坑，下面是踩过的坑，记在小本本上。

## 生效时间

Service Worker 会在注册后 **下次访问页面时** 生效，
不过可以在 `install` 事件时用 `event.waitUntil(self.skipWaiting())` ，
在 `active` 事件时用 `event.waitUntil(self.clients.claim())` 来立即控制客户端的下载过程。
新的服务工作线程接管页面下载会让下载过程变慢，所以一般都在 `window.onload` 事件中注册。
取决于具体用途，例如 vampire 需要它管理整个页面的缓存，为了让第一次打开页面就准备好离线
访问， vampire 甚至会刻意等待它注册完成并开始运行（`navigator.serviceWorker.ready`
会在当前客户端已被服务工作线程接管时 resolve）

## 生命周期

Service Worker 的生命周期，是个大坑。 `install` 和 `active` 事件只会触发一次，
以后所有的访问，只要没有新的服务工作线程接管，都不会再次触发。这就非常非常令人难过。
比如，注册一个 Service Worker，它的作用是对任何访问请求都返回 `123`，好嘛，
以后只要访问这个网站就只能看到 123 了。更坑的是，所有响应都是这个服务工作线程来处理，
不管你怎么更新服务端代码，没用的，浏览器根本不会向你的服务器发送请求，
它只会天真地认为你在从缓存中取回数据。如果你不慎把它部署在生产环境上，
大概就只能祈祷浏览器某一天良心发现行行好帮你处理掉这个坏家伙了。
（浏览器部分考虑到了这种情况，它会发现页面没有重新注册 Service Worker
并自动尝试重新注册同名同路径 Service Worker，如果服务端存在对应 sw 就会更新，
因此只要修改服务端的 Service Worker 来做出正确响应就好了，比如，立刻取消注册。
可是，如果你不知道或无权修改旧的服务工作线程呢？比如，它是被别人注册的，
或者是动态生成的，你就拿它完全没有办法了，因为浏览器可不认为 404 是个异常情况，
它仍然会让旧的缓存和旧的 service worker 继续管理整个页面的下载）。

什么？你想说，每次有新的访问时更新一次缓存不就好了？不存在的。
serviceWorker 没有任何方式知道何时有新的客户端访问，
也没有任何办法知道自己在给谁缓存什么样的首页。

## 主动检测坏家伙

因此，Service Worker 这么强，没人能制裁的了它，虽然浏览器有时候能帮助更新它，
但如果它自己没有发现出错或者不能自我更新，那就没有办法了。
所以它还是不得不需要小心自律，以防止自己缓存了错误的页面。

**先在线后离线** 的方式是一种比较好的规避这一问题的方案。如果用户在线（`navigator.onLine`
会在能够联网时返回 `true`），就提供在线内容，否则就提供缓存内容。这样既解决了刚刚的问题，
又为用户离线访问提供了便利，一举两得。

当然，这种方式存在它的问题：只是检查用户的在线状态，不是检查能否真的访问目标网站。
假如，某代理哪怕访问失败也会保持 HTTP 连接，从不返回 503，
或者服务器暂时无法对用户请求作出响应，这就非常糟糕了。
上述方式每 fetch 一个文件都不得不等待 30 秒才会被发现超时并关闭连接。
如果为用户提供离线数据和在线数据差别不大的话，
总是取得新数据是一件非常影响用户体验的事情。

因此，我们采取 **先离线后在线** 的策略，但这就有了两个问题：如果有了离线数据，
什么时候和服务器保持同步呢？如何保证离线的页面不是会给我们带来麻烦的 *坏家伙* 呢？
Google 的 Workbox 的做法是，告诉浏览器从不缓存 Service Worker
（如果不告诉，浏览器会缓存至多24 个小时），它也从来不改变自身文件名，
而是把所有需要离线的内容都作为 `manifest` 放在自身里面。通过在页面中监听 `controllerchange`
来检查页面离线内容是否有更新。

这样非常依赖服务端的自检，如果服务端返回了错误的内容，没有更新 Service Worker，
就完全没有办法了。

按照 W3C 的辣鸡标准，所有的 navigation request 是不会通知 Service Worker 的。
也就是说，哪怕是 Service Worker 自己，也没办法知道是不是有新的客户端访问。
浏览器为什么不能在有新客户的时候通知 Service Worker 呢？我觉得很奇怪。

所以，不能太依靠浏览器的奇怪的事件，还是要自己来检测新的客户端并自己解决。总之，
这是一件非常非常难的事情 QwQ，我尝试了很久，真的很久，哪怕现在还是有各种各样的问题。
不过，vampire 目前还是采用的我自己的解决方案，尽可能的少 fetch，
并尽可能的检测出各种各样的问题。不管怎么说，在目前的标准下，还是太难了。

## 本地调试

Service Worker 要求一个合法的 HTTPS 证书才能注册。不过好在，按照标准，
localhost 和 127.0.0.1 的任意端口都可以作为特例。无论是 Safari 还是 Chrome，
都遵照了这一标准。使用最新版 Chrome 是可以直接在 localhost 下注册 Service Worker 的。
如果还没有，当然也可以试试 `chrome --disable-web-security --allow-file-access-from-files --unsafely-treat-insecure-origin-as-secure=http://localhost --user-data-dir=%TEMP% --auto-open-devtools-for-tabs` （我个人很喜欢这条指令）

清除掉错误的 Service Worker 在 Edge 上是一件痛苦的事情，必须在控制台敲指令删除缓存。
不过在 Edge 上调试也很痛苦。服务工作线程的日志和网络请求必须单独开一个窗口，非常难过。
Chrome 在 F12 的 Application 标签页可以一键清除所有服务工作线程、缓存、数据库，非常强大。

---

再也不想写前端代码了(┬＿┬)

---

不过 Service Worker 真好玩。
