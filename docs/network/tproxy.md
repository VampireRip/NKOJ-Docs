### 设置透明代理

不是很了解 iptables 的配置，从别处拿的，但总之有用

Windows 下就要用 tun2socks 了，目前似乎还木有什么好的解决方案

```json
{
  "inbounds": [
    {
      "tag": "transparent",
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
      },
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "tproxy"
        }
      }
    }
  ],
  "outbounds": [
    {
      "tag": "proxy",
      "protocol": "socks",
      "settings": {
        "servers": [
          {
            "address": "192.168.37.1",
            "port": 1080
          }
        ]
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      },
      "mux": {
        "enabled": true
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIP"
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }
    },
    {
      "tag": "block",
      "protocol": "blackhole",
      "settings": {
        "response": {
          "type": "http"
        }
      }
    },
    {
      "tag": "dns-out",
      "protocol": "dns",
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }
    }
  ],
  "dns": {
    "servers": [
      "1.0.0.1",
      "1.1.1.1",
      "114.114.114.114",
      {
        "address": "223.5.5.5",
        "port": 53,
        "domains": [
          "geosite:cn",
          "ntp.org"
        ]
      }
    ]
  },
  "routing": {
    "strategy": "rules",
    "settings": {
      "domainStrategy": "IPOnDemand",
      "rules": [
        {
          "type": "field",
          "inboundTag": [
            "transparent"
          ],
          "port": 53,
          "network": "udp",
          "outboundTag": "dns-out"
        },
        {
          "type": "field",
          "inboundTag": [
            "transparent"
          ],
          "port": 123,
          "network": "udp",
          "outboundTag": "direct"
        },
        {
          "type": "field",
          "ip": [
            "223.5.5.5",
            "114.114.114.114"
          ],
          "outboundTag": "direct"
        },
        {
          "type": "field",
          "ip": [
            "1.0.0.1",
            "1.1.1.1"
          ],
          "outboundTag": "proxy"
        },
        {
          "type": "field",
          "protocol": [
            "bittorrent"
          ],
          "outboundTag": "direct"
        },
        {
          "type": "field",
          "ip": [
            "geoip:private",
            "geoip:cn"
          ],
          "outboundTag": "direct"
        },
        {
          "type": "field",
          "domain": [
            "geosite:cn"
          ],
          "outboundTag": "direct"
        }
      ]
    }
  }
}
```

```bash
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

iptables -t mangle -N V2RAY
iptables -t mangle -A V2RAY -d 127.0.0.0/16 -j RETURN
iptables -t mangle -A V2RAY -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A V2RAY -d 172.17.0.0/16 -j RETURN
iptables -t mangle -A V2RAY -d 255.255.255.255/32 -j RETURN 
iptables -t mangle -A V2RAY -d 192.168.0.0/16 -p tcp -j RETURN
iptables -t mangle -A V2RAY -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN
iptables -t mangle -A V2RAY -p udp -j TPROXY --on-port 12345 --tproxy-mark 1 # 给 UDP 打标记 1，转发至 12345 端口
iptables -t mangle -A V2RAY -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1 # 给 TCP 打标记 1，转发至 12345 端口
iptables -t mangle -A PREROUTING -j V2RAY # 应用规则

iptables -t mangle -N V2RAY_MASK
iptables -t mangle -A V2RAY_MASK -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A V2RAY_MASK -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A V2RAY_MASK -d 172.17.0.0/16 -j RETURN 
iptables -t mangle -A V2RAY_MASK -d 192.168.0.0/16 -p tcp -j RETURN # 直连局域网
iptables -t mangle -A V2RAY_MASK -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN # 直连局域网，53 端口除外（因为要使用 V2Ray 的 DNS）
iptables -t mangle -A V2RAY_MASK -j RETURN -m mark --mark 0xff    # 直连 SO_MARK 为 0xff 的流量(0xff 是 16 进制数，数值上等同与上面V2Ray 配置的 255)，此规则目的是避免代理本机(网关)流量出现回环问题
iptables -t mangle -A V2RAY_MASK -p udp -j MARK --set-mark 1   # 给 UDP 打标记,重路由
iptables -t mangle -A V2RAY_MASK -p tcp -j MARK --set-mark 1   # 给 TCP 打标记，重路由
iptables -t mangle -A OUTPUT -j V2RAY_MASK # 应用规则
```

持久化

```bash
mkdir -p /etc/iptables && iptables-save > /etc/iptables/rules.v4
cat << EOF > /etc/systemd/system/tproxyrule.service
[Unit]
Description=Tproxy rule
After=network.target
Wants=network.target

[Service]

Type=oneshot
ExecStart=/sbin/ip rule add fwmark 1 table 100 ; /sbin/ip route add local 0.0.0.0/0 dev lo table 100 ; /sbin/iptables-restore /etc/iptables/rules.v4

[Install]
WantedBy=multi-user.target
EOF
systemctl enable tproxyrule
```

遇到了 Docker 完全不能上网的问题，研究了几个小时不知道改了什么重启之后就好了，这是可能的解决路径：


```bash
# clear iptables
iptables -t mangle -Z
iptables -t mangle -F
iptables -t mangle -X

# debug iptables
sysctl net.netfilter.nf_log.2=nf_log_ipv4

# magic params
sysctl net.ipv4.conf.all.forwarding=1
sysctl net.ipv6.conf.all.forwarding=1
sysctl net.ipv4.conf.ens33.rp_filter=2
sysctl net.ipv4.conf.lo.rp_filter=0

# docker configuration
# edit /etc/systemd/system/multi-user.target.wants/docker.service, append
--iptables=false 

reboot
```