# 生化危机 · 生存人生

离线单机文字生存游戏原型。玩家在浣熊市外围经历两天、十个行动时段，通过探索、调查、社交、战斗和物资管理寻找撤离路线。

## 直接游玩

Windows x64 便携版发布在 GitHub Releases：

- [下载 v1.0.0 便携版](https://github.com/liangcc2124-ship-it/resident-evil-survival-life/releases/tag/v1.0.0)

下载 `生化危机-生存人生-Windows-x64.zip`，解压后双击 `Start-Game.cmd`。便携版内置 Node.js 运行环境，不需要另外安装依赖。

## 源码运行

进入 `prototype` 目录后双击 `Start-Game.cmd`，或运行：

```text
node tools/serve.cjs
```

然后访问 `http://127.0.0.1:4173`。开发与规则说明见 [prototype/README.md](prototype/README.md)，验收记录见 [prototype/TEST-REPORT.md](prototype/TEST-REPORT.md)。

## 项目内容

- `prototype/`：游戏源码、启动工具与自动测试。
- `docs/`：开发计划。
- 根目录三份中文文档：产品需求、技术设计与构建基础原文。
- `release/`：本地生成的便携版目录，不进入 Git；对应 ZIP 作为 Release 附件保存。

项目使用原生 HTML、CSS、JavaScript 和 Node.js 内置模块，不包含第三方运行依赖、CDN、账户系统或服务端业务接口。
