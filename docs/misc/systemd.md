添加一个最简单的 systemd-service:

以 rclone 为例（好用的网盘同步客户端？

在 `/etc/systemd/system/` 创建 `sync-onedrive.service`，内容大概如下：

```
[Unit]
Description=rsync Onedrive Service
After=network.target

[Service]
Type=exec
ExecStart=rclone mount MEGA: /home/sunrisefox/MEGA \
	--no-modtime \
	--vfs-cache-mode writes \
	--cache-tmp-upload-path=/tmp/rclone/upload \
        --cache-chunk-path=/tmp/rclone/chunks \
        --cache-workers=8 \
        --cache-writes \
        --cache-dir=/tmp/rclone/vfs \
        --cache-db-path=/tmp/rclone/db
ExecReload=/bin/kill -HUP $MAINPID
RestartSec=5
TimeoutStopSec=5
Restart=on-failure
SuccessExitStatus=SIGKILL
User=sunrisefox

[Install]
WantedBy=multi-user.target
```

执行

```bash
sudo systemctl start sync-onedrive.service
journalctl -u rsync-onedrive.service #看看状态
sudo systemctl enable sync-onedrive.service
```