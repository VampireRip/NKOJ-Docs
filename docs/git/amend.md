在修正 `vampire-os` 的错误的时候不知道出现了什么魔法事件，本地文件修改被重置了，但是 git 的日志却没有任何异常，因此，commit 和 push 的时候并没有发现，而是在 push 后，检查 GitHub 上的更改时发现了上上个版本的更改被撤销掉了。。

如果不是 GitHub 上有日志，我还以为是我上次在梦里做的修正然后其实并没有改T……T

完全不知道发生了什么，我也没有睡觉梦游的时候按 Ctrl + Z 的习惯。一般我修改什么东西，都是打开编辑器，修改，`add`，`commit`，`push`，检查 git 日志，关闭，一气呵成的。所以，要不是 Atom 或者 Windows 搞我，我真的想不到是为啥，总之，非常非常疑惑。

所以，就要研究研究怎么修正这个错误的 commit。

## 问题描述

在遇到以下情况时

+  `push` 了一个 `commit` 后，发现 commit 错误，使用 `--amend` 修正
+ 有其他魔法团队成员 push 了一个你完全不想要的 commit，很不巧你也同时做了一些修改

酱紫就会出现：

```bash
Your branch and 'origin/master' have diverged,
and have 1 and 1 different commits each, respectively
```

现在这样就很难过了。最简单的方式，如果可行的话，`git push --force`，之前的 commit 就被永久去除掉了，真棒！

然而很不巧，由于某些原因，这个 repo 恰好不支持 force update。

你说，这还不简单，直接 `git rebase origin/master` 不就好了嘛。

然而还是很不巧，这样做会导致不想要的改动被合并至我们的修改。

最终想要的是，**放弃远端的全部更改，只接受本地的 commit，且不能 force update**。

## 解决方案

```bash
git checkout -b tmp origin/master # 从 remote 的 master 重新创建一个分支 tmp
git revert HEAD # 撤销上次提交，产生一个 revert commit
git checkout master # 切回我们的 master 分支
git rebase tmp # rebase 到我们修改好的 master 分支
git branch -D tmp # 删掉创建的 tmp 分支
git push
```

这样，我们通过额外产生两个 `commit` 的方式（撤销上次提交 和 提交我们的更改）达到了在不 force update 的情况下修正我们的错误提交的目的。
