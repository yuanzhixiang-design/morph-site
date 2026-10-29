# CIRCAFORM 圆之象工业设计 — 官网（静态站 + 可视化后台）

一个**零依赖**的静态网站项目：首页 + 7 个二级页面（作品列表、4 个案例详情、方法、关于、联系、洞察列表、3 篇文章详情），内容全部存在 `content/` 目录的 JSON 文件里，构建脚本渲染成纯 HTML。
你可以在浏览器后台改内容，也可以直接改文件。

---

## 一、项目结构（哪些文件是干什么的）

```
morph-site/
├── content/
│   ├── home.json              ★ 首页全部文案、图片、数据
│   ├── works/                 每个案例一个文件（后台可增删）
│   ├── insights/              每篇文章一个文件（后台可增删）
│   └── pages/                 方法 / 关于 / 联系 三个独立页
├── build/
│   ├── helpers.js             公共外壳（导航/页脚/交互脚本）
│   ├── home.js                首页模板
│   └── subpages.js            二级页面模板
├── src/
│   ├── styles.css             样式：配色/字号/间距的变量都在开头 :root 里
│   └── assets/images/         图片（后台传图会存到这里）
├── generate.js                构建脚本：把 content/ + 样式 合成 dist/
├── serve.js                   本地预览小服务器
├── admin/                     可视化后台（Decap CMS）
└── dist/                      构建产物（上线就部署这个目录，不用手改）
```

**页面与内容的对应关系**：`/works/xxx/` 读 `content/works/xxx.json`；`/insights/xxx/` 读 `content/insights/xxx.json`；`/method/` `/about/` `/contact/` 读 `content/pages/` 下的同名文件。新增案例 = 后台点「新建案例」或复制一个 JSON 改内容。

## 二、本地预览（30 秒）

```bash
cd morph-site
npm run dev        # 等价于 node generate.js && node serve.js
```

浏览器打开 `http://localhost:4000` 看网站，`http://localhost:4000/admin/` 看后台。

> 改了 `content/home.json` 或样式后，重新跑一次 `node generate.js` 刷新即可。

## 三、改内容的两种方式

### 方式 A：浏览器后台（推荐，日常维护用这个）

1. 打开 `你的域名/admin/`，用 GitHub 账号登录
2. 左侧分四组，全部是中文表单：
   - **首页** — 首屏标题、精选作品卡、主案例、四步方法、洞察摘要、联系方式、页脚
   - **作品案例** — 可新建/删除；每个案例含封面、项目信息栏、Markdown 正文、配图
   - **洞察文章** — 可新建/删除；标题、摘要、封面、Markdown 正文
   - **独立页面** — 方法页（流程 + 服务模块）、关于页（数字/团队/奖项/品牌）、联系页（渠道 + 表单）
3. 右上角 **Publish → 保存**，约 1 分钟后线上自动更新

### 方式 B：直接改文件（适合批量修改）

用 VS Code 打开 `content/` 下对应的 JSON 文件改文字，
图片替换 `src/assets/images/` 下的同名文件，然后 `node generate.js`。

## 四、部署上线（一次性配置，约 20 分钟）

推荐 Cloudflare Pages（免费、全球 CDN、自动 HTTPS）：

1. 注册 [GitHub](https://github.com) 账号 → 新建仓库 `morph-site`，把本文件夹全部上传
2. 注册 [Cloudflare](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages → Connect to Git**，选你的仓库
3. 构建设置：
   - Framework preset: `None`
   - Build command: `node generate.js`
   - Build output directory: `dist`
4. 点部署。之后每次在后台点保存，网站自动重新发布

## 五、开通后台登录（一次性，约 15 分钟）

后台登录需要一个 GitHub OAuth 代理（免费）：

1. GitHub → Settings → Developer settings → **OAuth Apps → New**：
   - Homepage URL：你的 Cloudflare 网址
   - Callback URL：`https://你的OAUTH代理域名/callback`（见下一步）
   - 记下 Client ID，生成 Client Secret
2. 部署开源代理 [decap-oauth-cloudflare](https://github.com/i40west/decap-oauth-cloudflare)
   （在 Cloudflare Workers 里一键部署，把上面的 Client ID / Secret 填进去）
3. 打开 `admin/config.yml`，把开头两处改成：
   ```yaml
   repo: 你的GitHub用户名/morph-site
   base_url: https://你的代理.workers.dev
   ```
4. 重新部署。之后 `/admin/` 就能用 GitHub 账号登录了

## 六、绑定自己的域名

1. Cloudflare Pages 项目 → Custom domains → 添加你的域名
2. 按提示到域名注册商处加一条 CNAME 记录
3. HTTPS 证书自动签发

## 七、常见问题

| 问题 | 处理 |
|---|---|
| 后台保存后网站没更新 | Cloudflare Pages 构建需 1–2 分钟，可在 Pages 控制台看构建日志 |
| 图片太慢 | 上传前把图压缩到 500KB 内（推荐 squoosh.app） |
| 想改颜色/字号 | 改 `src/styles.css` 开头 `:root` 里的变量 |
| 想加新板块 | 这种结构性改动需要改 `build/` 下的模板，找 AI 帮忙最快 |
| 备案 | 用国内访问速度优先：域名在国内注册商购买 + 提交 ICP 备案（1–2 周）；免备案用 Cloudflare 默认域名或海外节点 |

## 八、上线前检查清单

- [ ] `content/` 里所有公司名、邮箱、电话、地址全部换成真实信息（案例、文章里的占位内容也要过一遍）
- [ ] 备案号换成真实 ICP 号（国内托管必须）
- [ ] 案例图换成真实项目图
- [ ] 浏览器标签页标题 / 描述（seo 字段）改成含"工业设计"的搜索词
- [ ] 手机上打开检查一遍（本站已做移动端适配）
- [ ] 联系页表单的提交地址（form.action）确认可用，测试发一条
