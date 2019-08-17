## 准备

### 安装 nginx

```bash
sudo apt update
sudo apt install nginx
```

## 配置

### 更新编码

修改 `/etc/nginx/nginx.conf`

```conf
# http 块中
charset UTF-8;
```

### 自定义 403 / 404

```conf

# http 块中
error_page   404  =404  /404.html;
error_page   403  =403  /403.html;

location = /403.html {
    root /var/www/html;
    allow all;
}
location = /404.html {
    root /var/www/html;
    allow all;
}
location / {
    deny all;
}
```

### 前端静态页面

假定静态页面在 `/var/www/vampire.rip/public`，接受来自 `vampire.rip www.vampire.rip` 的连接：

```bash
cd /etc/nginx/sites-available
vim vampire.rip.conf
```

修改内容为：

```conf
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl;
    listen [::]:443 ssl;

    root /var/www/vampire.rip/public;

    index index.html;

    server_name vampire.rip www.vampire.rip;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 创建链接，注意 ln 的第一个参数总必须是绝对路径！
ln -s /etc/nginx/sites-available/vampire.rip.conf /etc/nginx/sites-enabled/
# 测试
nginx -t # 应该不报告任何错误
# 重启
nginx -s reload
```

### 后端反向代理

假定后端在 `localhost:8001`，接受来自 `api.vampire.rip` 的连接：：

```conf
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name api.vampire.rip;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 高级反向代理

附带 cache 和 rewrite

创建目录 `/var/lib/nginx/cache`。

修改 `/etc/nginx/nginx.conf`，在 http 块中添加：

```conf
    ##
    # Cache
    #

    proxy_cache_path  /var/lib/nginx/cache  levels=1:2 inactive=1d keys_zone=staticfilecache:180m  max_size=700m;
```

修改目标 vhost 的配置文件：

```conf
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    ssl_certificate     /var/www/cert/cert;
    ssl_certificate_key /var/www/cert/key;
    server_name violette.vampire.rip;

    location /api/ {
        add_header Strict-Transport-Security "max-age=2592000; preload";
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header Referrer-Policy "no-referrer";
        proxy_pass http://example.com:4000/;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        sub_filter "http://example.com:4000" "https://violette.vampire.rip/api";
        sub_filter_once off;
        sub_filter_types text/css application/javascript;
    }

    location / {
        add_header Strict-Transport-Security "max-age=2592000; preload";
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header Referrer-Policy "no-referrer";

        proxy_pass http://example.com:4001/;
        proxy_http_version 1.1;
	    proxy_cache staticfilecache;
        proxy_cache_valid      200  1h;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;

        sub_filter "http://example.com:4000" "http://example.com/api";
        sub_filter_once off;
        sub_filter_types text/css application/javascript;
    }
}
```

## 证书

### Certbot

``` bash
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
```

```
sudo certbot --nginx certonly
```

### nginx

统一配置（设证书在 `/etc/letsencrypt/live/vampire.rip/`）：

修改 `/etc/nginx/nginx.conf`

```conf
# 在 http 块中
ssl_certificate     /etc/letsencrypt/live/vampire.rip/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/vampire.rip/privkey.pem;

ssl_ciphers         EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH;
ssl_protocols       TLSv1.2;
```

独立配置修改每一个 Server Block 即可。

```conf
ssl_session_cache   shared:SSL:10m;
ssl_session_timeout 10m;
```

```bash
nginx -t # 应该不报告任何错误
nginx -s reload
```
