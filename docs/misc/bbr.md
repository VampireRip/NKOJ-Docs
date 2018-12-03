
学了计算机网络，才知道为什么 TCP 这么慢。。可是，虽然 UDP 很快啦，目前的 HTTP 协议还不太能用 UDP
（可以期待的是，不久的将来 `QUIC` 就会在 HTTP 协议派上用场啦），再加上 mKCP 过分的重传机制，
虽然能把服务器带宽跑满，却也能把服务器的流量限额耗完。。

所以最后仔细考虑，还是要迁移到 TCP 协议才是。

但是传统的 `CUBIC` 拥塞控制算法在面对同机房一群如狼似虎的（甚至可能关闭了拥塞控制的）用户面前毫无还手之力，
再加上某网关的 QoS，下行速度能达到 10kb/s 已经很不错了。好在谷歌帮忙做了一个 BBR，据说这是一个自闭的算法，
不会像 `Reno` 和 `CUBIC` 一样被错误的反馈所影响。所以，我们就来试试看。

详细了解它们的区别：

+ [driving-bbr-pam-final.pdf](http://web.cs.wpi.edu/~claypool/papers/driving-bbr/driving-bbr-pam-final.pdf)
+ [bbr-new-kid-tcp-block](https://blog.apnic.net/2017/05/09/bbr-new-kid-tcp-block/)
+ [10-2018-05-15-bbr.pdf](https://ripe76.ripe.net/presentations/10-2018-05-15-bbr.pdf)

**下面的内容只适用于 CentOS ！**

## 升级内核版本

首先确认自己的内核版本

```bash
uname -msr
```

导入内核的 elrepo

```bash
rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-3.el7.elrepo.noarch.rpm 
```

安装最新的内核

```bash
yum --disablerepo="*" --enablerepo="elrepo-kernel" list available
yum --enablerepo=elrepo-kernel install kernel-ml
```

设置默认启动内核

```bash
# 这里应该能看到最新的内核应该在第 0 位，所以下面是 0
awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg
grub2-set-default 0
```

持久化引导配置，然后重新启动

```bash
grub2-mkconfig -o /boot/grub2/grub.cfg
# reboot
```

如果想要移除旧的内核，执行（不过它会保留至少三个内核）：

```bash
yum install yum-utils
package-cleanup --oldkernels
```

## 开启 BBR 拥塞控制

下面是我目前在用的配置，有一些扩展资料，可以阅读一下：

+ [另一套可能更优化更激进的配置](https://wiki.mikejung.biz/Sysctl_tweaks)
+ [队列算法 qdisc](https://github.com/systemd/systemd/issues/9725)
+ [详细介绍 qdisc](https://www.coverfire.com/articles/queueing-in-the-linux-network-stack/)
+ [协议细节](https://queue.acm.org/detail.cfm?id=2209336)

```bash
echo "net.core.default_qdisc=fq" >> /etc/sysctl.d/01network.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.d/01network.conf
```

持久化 && 重新加载配置文件

```bash
sysctl --system 
```

测试一下是不是生效了

```bash
# 应该能看到里面包含 bbr
sysctl net.ipv4.tcp_available_congestion_control
# 应该能看到最后一个数字不是 0
lsmod | grep bbr
```

一切完成。不需要重新启动即可生效。
