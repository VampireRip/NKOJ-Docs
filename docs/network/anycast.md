Vampire 真的很想有自己的网络，有自己的 ASN，有自己的 IP，自己做 BGP。

但是目前还完全没有办法呢，就从拥有自己的 IP 开始吧。

结果拥有的第一段 IP 就被自己搞出幺蛾子了QAQ

第一段是由 Free Range Cloud 赞助的一段 /48 的 IPv6，想要丢给 QuadraNet 去广播嘛，毕竟是到中国最好的网络。。然而人家 4 天没有理我，只好去找 drServer （是目前 Vampire 的服务器提供商哦）来做。

结果第二天早晨收到来自 QN 和 drServer 的两封邮件，说两边的 Announce 都做好了。。

好嘛，然后就是，有两台在不同机房的服务器有了同样的 IP 地址了。

向 Provider 确认过这样对别人没有太大影响，这样就算是组建了一个 Anycast 网络。当访问这个 IP 的时候，BGP 会优先找到最近的地方路由。

实际测试的时候，国内 CN2 和 联通 的出口是走 HE 最终到 drServer，美国的另一个机房是走 PCCW 最终到 QN，魔法。

唔，总之也不想麻烦 Provider 了，超级超级感谢他们在我探索的时候提供的帮助。drServer，CrownCloud 和 Free Range Cloud 都非常棒！
