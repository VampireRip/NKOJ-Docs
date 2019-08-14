MSI 的 GS65 不知道系统有什么谜之问题，在睡眠唤醒后， iwlwifi 会报告飞行模式按钮已被启用，而且不能通过飞行模式键关闭，所以非常非常难受。

故考虑重新编译 iwlwifi，禁用其飞行模式功能。

iwlwifi 使用 [backport-iwlwifi](https://git.kernel.org/pub/scm/linux/kernel/git/iwlwifi/backport-iwlwifi.git/) 构建。

下载源代码，执行 `make` 确定一切正常。

在源代码中搜索 `RFKILL`，在合适的地方跳过禁用功能的语句。

执行 `make && sudo make install` 编译最新的驱动。

`sudo modprobe -r iwlwifi && sudo modprobe iwlwifi` 重新加载驱动即可。
