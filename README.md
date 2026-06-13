# 游戏周边交易系统 Web

「游戏周边交易系统」Web 前端项目，基于 Vite + React + TypeScript。前端以路由级页面（pages）组织视图，以业务域（features）组织数据访问与业务能力，并通过统一的 HTTP 封装与鉴权 token 管理对接后端。

## 技术栈

- 构建：Vite
- 视图：React + React Router
- 语言：TypeScript
- 样式：Tailwind CSS（配合 clsx/tailwind-merge）
- 表单与校验：react-hook-form + zod
- 图表：recharts

## 依赖管理约定（重要）

新增/升级依赖一律使用 `pnpm add`，禁止通过手改 package.json 后再 install 的方式。

- 新增运行时依赖：`pnpm add <pkg>`
- 新增开发依赖：`pnpm add -D <pkg>`
- 升级依赖：`pnpm add <pkg>@<version>`
- 只做安装/还原环境：`pnpm install`

## 快速开始

### 1) 安装依赖

```bash
pnpm install
```

### 2) 配置环境变量

```bash
cp .env.example .env
```

```powershell
Copy-Item .env.example .env
```

默认环境变量（见 [.env.example](file:///d:/Codes/graduation-project/game-members-home-web/.env.example)）：

- `VITE_API_BASE_URL`：API 基地址，默认 `/api`

### 3) 启动开发环境

```bash
pnpm dev
```

默认启动在 `http://localhost:3000`（严格占用 3000 端口）。开发环境下已在 [vite.config.ts](file:///d:/Codes/graduation-project/game-members-home-web/vite.config.ts) 配置代理：

- `/api/*` → `http://localhost:8000`（并开启 ws 代理）

如果需要对接远端后端，优先改 `VITE_API_BASE_URL`（例如 `https://example.com/api`），并按需调整 Vite 代理策略。

## 常用命令

脚本定义见 [package.json](file:///d:/Codes/graduation-project/game-members-home-web/package.json)：

- 开发：`pnpm dev`
- 构建：`pnpm build`
- 预览：`pnpm preview`
- Lint：`pnpm lint`
- 格式化：`pnpm format`
- 类型检查：`pnpm type-check`

## 目录结构（概览）

```
src/
├── app/                    # 应用装配层（入口、路由、全局 Provider、store）
├── pages/                  # 页面（路由级），按业务角色/模块划分
├── features/               # 业务域（API/service/types 等）
├── shared/                 # 跨域共享（http 封装、token、env、utils）
├── components/             # 组件集合（ui/common/marketing 等）
├── hooks/                  # 全局 hooks（含通知/消息的 socket hook）
├── contexts/               # 全局上下文（如 AuthContext）
├── styles/                 # 全局样式
└── assets/                 # 静态资源
```

## 实时机制说明

- 通知：通过 WebSocket（见 `useNotificationSocket`）接收推送
- 私信/聊天：通过 WebSocket（见 `useMessageSocket`）接收新消息
- 会话列表/未读状态：页面侧以 `setInterval` 做简单轮询刷新（默认 10s）
