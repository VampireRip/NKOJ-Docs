## 编码

```
export LC_ALL=en_US.utf8
export LANG="$LC_ALL"
```

## 主机名

```bash
sudo hostname <主机名>
vi /etc/hostname # 改为主机名

# 如果在 Ubuntu Cloud 上

vim /etc/cloud/cloud.cfg # 将 preserve_hostname 改为 true
```

## 防火墙

记得 ufw 并不是很好用，所以还是装了 firewalld

```bash
sudo systemctl stop iptables
# 防止它被启动
sudo systemctl mask iptables
sudo apt-get remove ufw
```

```bash
sudo apt install firewalld
sudo systemctl enable firewalld
sudo systemctl start firewalld
```

## 查看占用的端口

```bash
netstat -tulnp
# 或者
lsof -n
```

## SSH

```bash
vim /etc/ssh/sshd_config
```

### 端口号

```
Port 6444
```

### 超时

```
ClientAliveInterval 120
ClientAliveCountMax 30
```

### 公钥

```
PasswordAuthentication no
```

本机执行

```bash
cat ~/.ssh/id_rsa.pub | ssh <用户名>@<地址> 'cat >> ~/.ssh/authorized_keys'
```

服务器执行

```bash
service sshd restart
```

## 添加账户

```bash
# 密码随便乱输两个不一样的
adduser <用户名>
# 添加进 sudoer
usermod -aG sudo <用户名>
# 切换到用户
su -- <用户名>
# 然后把公钥拷贝进 .ssh/authorized_keys
...

# sudo 无需使用密码
sudo visudo
# 添加一行
<用户名> ALL=(ALL) NOPASSWD: ALL
```

## 默认 mv 移动隐藏文件

```bash
# ~/.bashrc
shopt -s dotglob
```

## 安装 Docker

[源网站](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-docker-ce-1)

[Docker Compose](https://github.com/docker/compose/releases)

```bash
curl -fsSL get.docker.com | CHANNEL=test sh
```

## IP 地址配置

```bash
# 有多个 IP 时选择默认网关
ip route replace default via <Gateway> dev <DEV> src <IP>

# 添加多个 IPv6 地址
$IP6BLOCK="2001::41d0:2:ad64::/64"
ip add add local $IP6BLOCK dev lo
ip route add local $IP6BLOCK dev eth0
sysctl  net.ipv6.ip_nonlocal_bind = 1

# 配置 ndppd
route-ttl 30000

proxy eth0 {

   router no

   timeout 500
   ttl 30000
   rule 2001::41d0:2:ad64::/64{
       static
   }
}
```