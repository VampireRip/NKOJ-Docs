部署 Nextcloud

### 安装 docker 和 docker-composer

在 vpsconf.md 里啦。

### 部署准备

```bash
docker run --name nextcloud -d -p 9000:80 -v /var/www/nextcloud:/var/www/html nextcloud
```

### 修正链接地址

一些链接会出错，总之可以自己修改一下。

```bash
# 还要在 owncloud-docker-server 文件夹中
docker exec -ti nextcloud /bin/bash

vi config/config.php

apt-get install aria2
mkdir /var/log/aria2c /var/local/aria2c
touch /var/log/aria2c/aria2c.log
touch /var/local/aria2c/aria2c.sess
chown www-data.www-data -R /var/log/aria2c /var/local/aria2c
chmod 770 -R /var/log/aria2c /var/local/aria2c

# 要在 www-data 下执行
sudo -u www-data aria2c --enable-rpc --rpc-allow-origin-all -c -D --log=/var/log/aria2c/aria2c.log --check-certificate=false --save-session=/var/local/aria2c/aria2c.sess --save-session-interval=2 --continue=true --input-file=/var/local/aria2c/aria2c.sess --rpc-save-upload-metadata=true --force-save=true --log-level=warn
```

添加一些魔法：

```php
'overwritehost' => 'oc.vampire.rip',
# 如果只通过 https 的话 ↓
'overwriteprotocol' => 'https'
```

### 配置 nginx

添加个 vhost，https 证书，配置好 ssl。

在对应的 `server block` 中配置最大可以上传的文件大小，比如这样：

```conf
client_max_body_size 4000M;

sendfile on;
send_timeout 600s;
```

### 配置 firewalld

可以写个 rich-rule 做 port-forward
