刚开始用的时候，觉得 Firewalld 真的好难用的说，完全不懂为什么 `firewall-cmd` 只能在 firewalld 启动的时候才能使用嘛。。

记得第一次用的时候，直接把 ssh 端口给禁用了，这可惨了。。
停用 `firewalld` -> 修正不了错误的配置，启用 `firewalld`，ssh 连不上，还是修正不了错误的配置。
明明就是写文件嘛！干嘛弄得这么麻烦 o(╥﹏╥)o

找了好久，挂载救援模式，`cp /usr/lib/firewalld/services/ssh.xml /etc/firewalld/services/`，然后修改这个文件的 ssh 对应端口号为正常端口号，重新启动至正常模式，大概才可以。

然后后来知道了可以用 `firewall-offline-cmd` 在 firewalld 离线的时候使用。

```bash
firewall-cmd --reload # 采用磁盘上的配置文件
firewall-cmd --runtime-to-permanent # 采用内存中的配置并写入磁盘
```

一个可能的 [`rich rule`](https://firewalld.org/documentation/man-pages/firewalld.richlanguage.html), [`rich rule 2`](https://firewalld.org/2018/12/rich-rule-priorities):

（事实证明这个东西并没有什么用，管理起来还麻烦）

```
firewall-cmd --add-rich-rule='rule family="ipv4" destination address="[ip4]" forward-port port="80" protocol="tcp" to-port="8080" to-addr="127.0.0.1"'
```

不管怎么说，下面的 [服务](https://firewalld.org/documentation/man-pages/firewalld.service.html) 似乎更好用一点：

默认服务在 `/usr/lib/firewalld/services`

自定义服务放在 `/etc/firewalld/services` 里面然后 `firewall-cmd --add-service=<name>` 就可以了。

```
<?xml version="1.0" encoding="utf-8"?>
<service>
  <short>www</short>
  <description>HTTP and HTTPS nginx service</description>
  <port protocol="tcp" port="80"/>
  <port protocol="tcp" port="443"/>
  <port protocol="udp" port="443"/>
  <destination ipv4="[ip4]" ipv6="[ip6]"/>
</service>
```
