用户组 

用 gpasswd！

```
Usage: gpasswd [option] GROUP

Options:
  -a, --add USER                add USER to GROUP
  -d, --delete USER             remove USER from GROUP
  -h, --help                    display this help message and exit
  -Q, --root CHROOT_DIR         directory to chroot into
  -r, --remove-password         remove the GROUP's password
  -R, --restrict                restrict access to GROUP to its members
  -M, --members USER,...        set the list of members of GROUP
  -A, --administrators ADMIN,...
                                set the list of administrators for GROUP
Except for the -A and -M options, the options cannot be combined.
```

cat /etc/group 看到的是组所拥有的用户！

修改完用户组权限要重新登录才生效。

用户只有全部父文件夹都有执行权限时，才能访问某一文件夹。

查看日志

journalctl -u service-name.service -b

