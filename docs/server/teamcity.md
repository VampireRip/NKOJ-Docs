
由于懒得部署环境，所以就要各种用 Docker 嘛，那么在 Docker 里面用 TeamCity CI 是一种怎样的体验呢0.0

Vampire 服务器是 8 核心 CPU，打开 TeamCity 就跑到了 800%，思考。

坑：

##### 在 Docker 上使用 Postgres：

+ 需要 `firewall-cmd` 信任 `docker0` 适配器，不然也是会被它无条件丢掉的
+ 需要设置 postgresql.conf （也许在 `/var/lib/pgsql/11/data`）监听 `172.17.0.1`
+ 需要设置 `pg_hba.conf` 让 docker 的 `172.17.0.0/16` 是 `password` 验证

##### 在 Docker 里使用 Docker

+ 需要启动时额外 `-v /var/run/docker.sock:/var/run/docker.sock`，酱紫启动的 docker 是兄弟而不是孩子
+ 将需要执行权限的地方映射到主机，比如 TeamCity 需要的路经如下

```bash
docker run -it --name teamcity-server -v /var/www/teamcity:/data/teamcity_server/datadir  -v /var/log/teamcity:/opt/teamcity/logs -p 8111:8111 -d jetbrains/teamcity-server

docker run -it --name teamcity-agent -e SERVER_URL="http://172.17.0.1:8111" -v /var/www/teamcity_agent:/data/teamcity_agent/conf -v /var/run/docker.sock:/var/run/docker.sock -v /opt/buildagent/work:/opt/buildagent/work -v /opt/buildagent/temp:/opt/buildagent/temp -v /opt/buildagent/tools:/opt/buildagent/tools -v /opt/buildagent/plugins:/opt/buildagent/plugins -v /opt/buildagent/system:/opt/buildagent/system  -d jetbrains/teamcity-agent
```
