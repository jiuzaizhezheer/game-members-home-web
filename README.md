# Game Members Home Web 项目结构

## 依赖管理约定（重要）

新增/升级依赖一律使用 pnpm add，禁止通过手改 package.json 后再 install 的方式。

- 新增运行时依赖：`pnpm add <pkg>`
- 新增开发依赖：`pnpm add -D <pkg>`
- 升级依赖：`pnpm add <pkg>@<version>`
- 只做安装/还原环境：`pnpm install`

## 目录结构
```
src/
├── app/                    # 应用装配层（入口）
│   ├── main.tsx
│   ├── router.ts
│   ├── store.ts
│   └── providers.tsx
│
├── pages/                  # 页面（路由级）
│   ├── login/
│   │   ├── index.tsx
│   │   └── useLogin.ts
│   └── dashboard/
│
├── features/               # 业务域（核心）
│   ├── user/
│   │   ├── service.ts
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── hooks.ts
│   └── auth/
│
├── components/             # 通用 UI 组件（无业务）
│   ├── Button/
│   ├── Modal/
│   └── Table/
│
├── hooks/                  # 全局通用 hooks（无业务）
│   └── useDebounce.ts
│
├── services/               # 跨业务服务（可选）
│   ├── authService.ts
│   └── permissionService.ts
│
├── shared/                 # 纯共享（无状态）
│   ├── api/                # 请求封装
│   ├── utils/
│   ├── constants/
│   └── config/
│
├── contexts/               # 全局运行态
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── styles/                 # 全局样式
│   └── index.css
│
├── types/                  # 全局类型
│   └── global.d.ts
│
└── assets/                 # 静态资源
