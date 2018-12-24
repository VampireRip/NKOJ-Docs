ownCloud 部署起来好麻烦！网上的教程都是推荐使用 Apache，MySQL 和 Memcached，这对我 nginx，postgreSQL, redis 党很不友好嘛！而且还要用 PHP，难过。

所以干脆装在 Docker 里面好啦！幸好 ownCloud 在 Docker 上也有镜像，甚至有一个开箱即用的教程，非常开心。

[https://github.com/owncloud-docker/server#launch-with-plain-docker](https://github.com/owncloud-docker/server#launch-with-plain-docker)

### 安装 docker 和 docker-composer

在 vpsconf.md 里啦。

### 部署准备

假定映射到本机端口 9999，管理是 admin:admin

```bash
# Create a new project directory
mkdir owncloud-docker-server

cd owncloud-docker-server

# Copy docker-compose.yml from the GitHub repository
wget https://raw.githubusercontent.com/owncloud-docker/server/master/docker-compose.yml

# Create the environment configuration file
cat << EOF > .env
OWNCLOUD_VERSION=10.0
OWNCLOUD_DOMAIN=localhost
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
HTTP_PORT=9999
EOF

# Build and start the container
docker-compose up -d
```

等到 `docker-compose logs --follow owncloud` 显示已经没什么日志了，大概就已经准备完毕啦。

这样子部署好的话，存储的文件会在 `/var/lib/docker/volumes` 里面。

### 修正 logout 链接地址

不知道为什么 logout 的链接会出错，总之可以自己修改一下。

```bash
# 还要在 owncloud-docker-server 文件夹中
docker-compose exec owncloud vi config/config.php
# 启动 bash 的话是 
# docker-compose exec owncloud bash
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
