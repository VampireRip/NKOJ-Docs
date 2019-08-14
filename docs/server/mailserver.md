### MailServer 的部署

以前一直用的是 QQ 的企业邮箱，因为名声好，不用管理，结果还是嫌弃 2FA 太麻烦，后来强制验证手机，就干脆弃用了吧。

现在 Vampire 使用的是 CloudCone 同款的 [Mailcow](https://mailcow.github.io/mailcow-dockerized-docs/prerequisite-system/)

#### DNS

```bash
mail                IN A       1.2.3.4
autodiscover        IN CNAME   mail
autoconfig          IN CNAME   mail

@                   IN MX 10   mail

# v=spf1 a mx a:mail.vampire.rip ~all
@                   IN TXT     "v=spf1 mx ~all"

# handled by mailcow
dkim._domainkey  IN TXT     "v=DKIM1; k=rsa; t=s; s=email; p=..."

# v=DMARC1; p=quarantine; rua=mailto:vampire@vampire.com; ruf=mailto:mail-abuse@vampire.rip; rf=afrf; sp=none; fo=1; pct=25; adkim=r; aspf=s
_dmarc              IN TXT     "v=DMARC1; p=reject; rua=mailto:mailauth-reports@example.org"
```

#### 安装

```bash
cd /opt
git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized

./generate_config.sh

# 编辑配置文件，在 vampire-api 中有所用模板
vim mailcow.conf
```

```bash

# 证书
rm -f data/assets/ssl/key.pem
rm -f data/assets/ssl/cert.pem
ln $(readlink -f /etc/letsencrypt/live/vampire.rip/privkey.pem) data/assets/ssl/key.pem
ln $(readlink -f /etc/letsencrypt/live/vampire.rip/fullchain.pem) data/assets/ssl/cert.pem

docker-compose pull
docker-compose up -d
```

#### firewall-cmd 的配置

这里很魔法，不知道为什么，有时候配置完还是不允许 Docker 访问，待测试。

```bash
firewall-cmd --permanent --add-service=smtp
firewall-cmd --permanent --add-service=smtps
firewall-cmd --permanent --add-service=imap
firewall-cmd --permanent --add-service=imaps
firewall-cmd --permanent --zone=trusted --add-interface=br-mailcow
firewall-cmd --add-masquerade
firewall-cmd --reload
```

#### 默认密码

是 `admin` 和 `moohoo`，记得改！