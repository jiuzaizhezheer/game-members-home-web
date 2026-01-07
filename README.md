# GMHS Web 项目结构

## 根目录
```
gmhs-web/
├── public/                 # 静态资源目录
│   ├── images/             # 图片资源
│   ├── icons/              # 图标资源
│   ├── data/               # 静态数据文件
│   └── vite.svg            # Vite 默认图标
├── src/                    # 源代码目录
│   ├── assets/             # 静态资源（React SVG）
│   ├── components/         # 组件目录
│   │   ├── ui/             # UI 组件
│   │   ├── common/         # 公共组件
│   │   └── layout/         # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── home/           # 首页
│   │   ├── about/          # 关于页面
│   │   └── contact/        # 联系页面
│   ├── hooks/              # 自定义 Hooks
│   ├── utils/              # 工具函数
│   ├── services/           # 服务层（API 请求等）
│   ├── styles/             # 样式文件
│   ├── types/              # TypeScript 类型定义
│   ├── contexts/           # React Context
│   ├── App.css             # 应用样式
│   ├── App.tsx             # 应用根组件
│   ├── index.css           # 全局样式
│   └── main.tsx            # 应用入口文件
├── .gitignore              # Git 忽略文件配置
├── README.md               # 项目说明文档
├── eslint.config.js        # ESLint 配置文件
├── index.html              # HTML 模板文件
├── package-lock.json       # npm 锁文件
├── package.json            # 项目配置文件
├── tsconfig.app.json       # TypeScript 应用配置
├── tsconfig.json           # TypeScript 主配置
├── tsconfig.node.json      # TypeScript Node 配置
└── vite.config.ts          # Vite 配置文件
```

## 目录说明

### `public/`
存放静态资源文件，在构建时会直接复制到输出目录的根目录下。

### `src/assets/`
存放项目中使用的图片、SVG 等静态资源。

### `src/components/`
存放可复用的 React 组件：
- `ui/`: 存放基础 UI 组件，如按钮、输入框等
- `common/`: 存放业务通用组件
- `layout/`: 存放布局相关组件，如头部、侧边栏、页脚等

### `src/pages/`
存放页面级组件：
- `home/`: 首页相关组件
- `about/`: 关于页面相关组件
- `contact/`: 联系页面相关组件

### `src/hooks/`
存放自定义 React Hooks。

### `src/utils/`
存放工具函数，如格式化函数、辅助函数等。

### `src/services/`
存放与后端交互的服务层代码，如 API 请求封装。

### `src/styles/`
存放全局样式文件或样式相关的工具。

### `src/types/`
存放 TypeScript 类型定义文件。

### `src/contexts/`
存放 React Context 相关代码，用于状态管理。