module.exports = {
  title: 'Vampire Ink',
  description: 'Where the vampire reads and writes',
  themeConfig: {
    nav: [
      { text: 'vampire-ink', link: '/home' },
      { text: 'vampire-rip', link: 'https://vampire.rip' },
    ],
    sidebar: [
      ['/home', '主页'],
      {
        title: 'Vampire 的归宿',
        collapsable: false,
        children: [
          ['/server/vpsconf.md', 'VPS 的初始配置'],
          ['/server/firewalld.md', '令人心安的防火墙'],
          ['/server/bbr.md', 'BBR 拥塞控制算法'],
          ['/server/vhost.md', 'Virtual Hosts(Server Blocks)'],
          ['/server/teamcity.md', 'Docker in Docker & Vampire CI'],
          ['/server/owncloud.md', 'Nextcloud 的魔法部署'],
          ['/server/mailserver.md', 'Vampire Mail'],
        ]
      },
      {
        title: '前端的 Vampire',
        collapsable: false,
        children: [
          ['/vampire/codingstyle.md', '有趣的 Coding Style'],
          ['/vampire/sw.md', '糟糕的 Service Worker']
        ]
      },
      {
        title: '后端的 Vampire',
        collapsable: false,
        children: [
          ['/backend/bdd.md', 'mocha 测试'],
          ['/backend/pm2.md', 'Vampire 的 pm2'],
        ]
      },
      {
        title: 'Vampire 网络',
        collapsable: false,
        children: [
          ['/network/tproxy.md', 'Vampire 透明代理'],
          ['/network/anycast.md', 'Vampire Anycast?'],
        ]
      },
      {
        title: '桌面版 Vampire',
        collapsable: true,
        children: [
          ['/misc/vmware-install-to-usb.md', '通过 VMWare 向 U 盘装系统'],
          ['/desktop/disablemidpaste.md', '禁用 GDM 鼠标中键粘贴'],
          ['/desktop/compileiwlwifi.md', '编译 iwlwifi'],
          ['/desktop/compilegnome.md', '编译 gnome'],
        ]
      },
      {
        title: '吐槽 & 杂项',
        collapsable: true,
        children: [
          ['/misc/disable-format-popup.md', '禁用"使用驱动器之前需要将其格式化"'],
          ['/misc/git-amend.md', '奇怪的 Git Revert 事件'],
          ['/misc/visualstudio.md', '辣鸡 Visual Studio'],
          ['/misc/autoremove.md', 'Ubuntu 的自动移除'],
          ['/misc/usergroup.md', '用户与用户组'],
          ['/misc/systemd.md', '添加 Systemd 服务'],
          ['/misc/postgres-install.md', 'PostgreSQL 的魔法安装'],
        ]
      },
    ],
    repo: 'vampire-rip/vampire-docs',
    repoLabel: 'GitHub',
    docsDir: 'docs',
    editLinks: true,
    editLinkText: '你说的不对，我有意见！',
    lastUpdated: '上次更新',
  },
  evergreen: true,
}
