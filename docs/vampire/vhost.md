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
