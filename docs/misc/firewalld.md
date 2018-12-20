刚开始用的时候，觉得 Firewalld 真的好难用的说，完全不懂为什么 `firewall-cmd` 只能在Firewalld 启动的时候才能使用、

记得第一次用的时候，直接把 ssh 端口给禁用了，这可惨了。。
停用 `firewalld` -> 修正不了错误的配置，启用 `firewalld`，ssh 连不上，还是修正不了错误的配置。
明明就是写文件嘛！干嘛弄得这么麻烦 o(╥﹏╥)o

找了好久，挂载救援模式，`cp /usr/lib/firewalld/services/ssh.xml /etc/firewalld/services/`，然后修改这个文件的 ssh 对应端口号为正常端口号，重新启动至正常模式，大概才可以。

然后后来知道了可以用 `firewall-offline-cmd` 在 Firewalld 离线的时候使用。

```bash
firewall-cmd --reload # 采用磁盘上的配置文件
firewall-cmd --runtime-to-permanent # 采用内存中的配置并写入磁盘
```

一个可能的 [`rich rule`](https://firewalld.org/documentation/man-pages/firewalld.richlanguage.html):

```
firewall-cmd --add-rich-rule='rule family="ipv4" destination address="198.51.100.237" forward-port port="80" protocol="tcp" to-port="8080" to-addr="127.0.0.1"'
```