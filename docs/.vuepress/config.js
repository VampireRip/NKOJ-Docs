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
          ['/vampire/bdd.md', 'mocha 测试'],
          ['/postgres/install.md', 'PostgreSQL 的魔法安装'],
          ['/vampire/pm2.md', 'Vampire 的 pm2'],
        ]
      },
      {
        title: 'Vampire 的归宿',
        collapsable: false,
        children: [
          ['/misc/vpsconf.md', '新 VPS 的配置'],
          ['/misc/firewalld.md', 'firewalld 防火墙'],
          ['/misc/bbr.md', '使用 BBR 拥塞控制算法'],
          ['/vampire/vhost.md', 'Virtual Hosts(Server Blocks)'],
          ['/vampire/systemd.md', '添加 Systemd 服务'],
        ]
      },
      {
        title: 'Git 的魔法使用',
        collapsable: false,
        children: [
          ['/git/amend.md', '奇怪的 Git Revert 事件'],
        ]
      },
      {
        title: '吐槽 & 杂项',
        collapsable: false,
        children: [
          ['/misc/visualstudio.md', '辣鸡 Visual Studio'],
          ['/misc/autoremove.md', 'Ubuntu 的自动移除'],
          ['/misc/disablemidpaste.md', '禁用 GDM 鼠标中键粘贴'],
          ['/misc/compileiwlwifi.md', '编译 iwlwifi'],
          ['/misc/compilegnome.md', '编译 gnome'],
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
