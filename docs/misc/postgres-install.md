Outdated! Postgres 现在有魔法存储库，即使在 Ubuntu 上只要添加源就可以直接 apt 安装了

不知道为什么在 `Ubuntu 18.04` 上安装 `Postgres 11` 一直出现各种问题。。

明明以前只需要 `apt install postgres-10` 就好了，为什么，怎么会变成这个样子呢。。

不管怎样，这是一次成功的安装尝试QwQ：

## 安装前的准备

+ 给 postgres 添加一个账户，postgres。如果是 `Ubuntu 18.04` 的话，它可能已经做好这件事情了（据说是自带 postgres-10 的）。

```bash
cat /etc/passwd | grep 'postgres' #看看是不是已经有了
sudo useradd -d /var/lib/postgresql -s /bin/bash -c 'PostgreSQL administrator' -m postgres
# ↑ 没有的话，创建一个，目录是 /var/lib/postgresql
```

+ 准备依赖。postgres 除了 `build-essential` 以外似乎是只需要 `libreadline-dev`：

```bash
sudo apt-cache search libreadline # 看看包名叫啥
sudo apt install libreadline-dev
```

+ 下载 [postgres 源代码](https://www.postgresql.org/ftp/source/)，解压并准备构建。

## 安装

很简单啦，就是和普通软件构建方式一样吧，大概

```bash
./configure --prefix=/usr/local/postgres # 当然装在哪都可以啦
make
sudo make install
```

反正我是一次成功了。。

## 初始化 postgres

```bash
sudo su -- postgres # 切换到 postgres 账户
cd /usr/local/postgres/bin # 切换到安装目录
./initdb -D ~/data
```

如果一切顺利，应该能够看到：

```
Success. You can now start the database server using:
  ./pg_ctl -D /var/lib/postgresql/data -l logfile start
```

我们先测试一下，总之，继续留在 postgres 账户。

```bash
./postgres -D /var/lib/postgresql/data # 测试一下
```

如果没有错误，不错哦，可以暂时停止掉它了。

## 创建系统服务

```bash
sudo vim /etc/init.d/postgresql # 大概率它已经在这里了
```

调整文件内容为（基于 https://blog.2ndquadrant.com/creating-a-postgresql-service-on-ubuntu/ 改动）：

```shell
#!/bin/bash

PREFIX="/usr/local/postgres"
PGDATA="/var/lib/postgresql/data"
PGUSER=postgres

PGLOG="$PGDATA/serverlog"

PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON_ENV=

PGCTL="$PREFIX/bin/pg_ctl"

set -e

test -x $PGCTL ||
{
    echo "$PGCTL not found"
    if [ "$1" = "stop" ]
    then exit 0
  else exit 1
    fi
}

case $1 in
  start)
    echo -n "Starting PostgreSQL"
    su - $PGUSER -c "$DAEMON_ENV $PGCTL start -w -D '$PGDATA' -l '$PGLOG'"
    ;;
  stop)
    echo -n "Stopping PostgreSQL"
    su - $PGUSER -c "$PGCTL stop -D '$PGDATA' -s -m smart"
    ;;
  restart)
    echo -n "Restarting PostgreSQL"
    su - $PGUSER -c "$PGCTL restart -D '$PGDATA' -s -m fast"
    ;;
  reload)
    echo -n "Reloading PostgreSQL"
    su - $PGUSER -c "$PGCTL reload -D '$PGDATA' -s"
    ;;
  status)
    su - $PGUSER -c "$PGCTL status -D '$PGDATA'"
    ;;
  *)
    # Print help
    echo "Usage: $0 {start|stop|restart|reload|status}" 1>&2
    exit 1
    ;;
esac
exit 0
```

调整为合适的权限：

```bash
sudo chmod 700 /etc/init.d/postgresql
```

更新：

```bash
sudo update-rc.d postgresql defaults
```

试试看：

```bash
sudo service postgresql status
sudo service postgresql start
sudo service postgresql stop
sudo service postgresql restart
```

## 修改 Domain Socket 的位置

Ubuntu 自带一个魔法版本的 psql，如果运行 psql 的时候提示：

```
psql: could not connect to server: No such file or directory
        Is the server running locally and accepting
        connections on Unix domain socket "/var/run/postgresql/.s.PGSQL.5432"?
```

那么我们就要想想办法来修改它的默认位置了。当然，我们自己编译的 psql 是没问题的，所以可以添加到环境变量里面：

```bash
# 不适用于 WSL
sudo vim /etc/environment # 最好别改崩了...

# WSL 改这个文件：
sudo vim /etc/bash.bashrc # WSL
```

在 `environment` 的 `PATH="` 后加入 `/usr/local/postgres/bin:`
或者在 `bash.bashrc` 的最后加入 `export PATH=/usr/local/postgres/bin:$PATH:`

注销，或者关掉会话重新打开，就可以生效啦。

再执行 `psql` 试试看？是不是可以成功连接了。

当然要切换到 postgres 账户才能管理。

（编译 postgresql 的时候我们也可以改一改，在 `src/include/pg_config_manual.h` 的 `DEFAULT_PGSOCKET_DIR`，如果改成 `/var/run/postgresql` 的话就和系统自带的一样了。）

至此 `postgreSQL` 就安装完毕啦，回顾一下，我们的可执行文件在 `/usr/local/postgres/bin`，配置目录在 `/var/lib/postgresql/data`，日志在 `/var/lib/postgresql/data/serverlog`
