gdm （或者也许是 xserver） 会劫持鼠标中键，自动粘贴在剪贴板里面的内容。

这个功能对于不太熟悉的人来说可太 xx 了。。

在用 Visual Studio Code 的时候，常常是在鼠标中键关闭标签页的同时就把剪贴板里面的内容粘贴进去了，所以经常造成各种莫名其妙的错误。

所以当然是要禁用掉啦！

### 解决方案

```bash
sudo apt install xbindkeys xsel xdotool
vim ~/.xbindkeysrc
```

在其中插入：

```bash
"echo -n | xsel -n -i; pkill xbindkeys; xdotool click 2; xbindkeys"
b:2 + Release
```

随后

```bash
xbindkeys -p # 重新加载配置文件

# 不知道会不会自动启动 xbindkeys，总之我这边是会自动启动的，如果不会，启动
xbindkeys
```

一切 OK ！ （巧妙地躲开了重新编译 gdm 的问题）
