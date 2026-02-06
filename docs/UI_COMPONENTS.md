# StayNeos v2.0 UI/UX 组件库文档

## 设计规范
- **风格**: 方形 UI (无圆角)
- **主色**: #003B5C (深海蓝)
- **强调色**: #C9A962 (金色)
- **字体**: Inter

---

## 1. UI 组件

### DatePicker - 日期选择器
```tsx
import { DatePicker } from "@/components/ui";

<DatePicker
  label="入住日期"
  value={selectedDate}
  onChange={setSelectedDate}
  minDate={new Date()}
  placeholder="选择日期"
/>
```

### RangeSlider - 价格区间滑块
```tsx
import { RangeSlider } from "@/components/ui";

<RangeSlider
  label="价格范围"
  min={0}
  max={10000}
  value={[1000, 5000]}
  onChange={(value) => console.log(value)}
  formatValue={(v) => `$${v}`}
/>
```

### Accordion - 折叠面板
```tsx
import { Accordion, AccordionItemComplete } from "@/components/ui";

// 基础用法
<Accordion>
  <AccordionItemComplete
    id="item-1"
    trigger="标题 1"
  >
    内容 1
  </AccordionItemComplete>
  <AccordionItemComplete
    id="item-2"
    trigger="标题 2"
  >
    内容 2
  </AccordionItemComplete>
</Accordion>

// 或使用简单版本
import { SimpleAccordion } from "@/components/ui";

<SimpleAccordion
  items={[
    { id: "1", trigger: "标题 1", content: "内容 1" },
    { id: "2", trigger: "标题 2", content: "内容 2" },
  ]}
/>
```

### Tabs - 标签页
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";

<Tabs defaultTab="tab1">
  <TabsList>
    <TabsTrigger value="tab1">标签 1</TabsTrigger>
    <TabsTrigger value="tab2">标签 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">内容 1</TabsContent>
  <TabsContent value="tab2">内容 2</TabsContent>
</Tabs>

// 或使用简单版本
import { SimpleTabs, PillsTabs } from "@/components/ui";

<SimpleTabs
  tabs={[
    { id: "1", label: "标签 1", content: <div>内容 1</div> },
    { id: "2", label: "标签 2", content: <div>内容 2</div> },
  ]}
/>
```

### Toast - 消息提示
```tsx
import { ToastProvider, useToastHelpers } from "@/components/ui";

// 在 layout.tsx 中包裹应用
export default function RootLayout({ children }) {
  return (
    <ToastProvider position="top-right">
      {children}
    </ToastProvider>
  );
}

// 在组件中使用
function MyComponent() {
  const toast = useToastHelpers();

  const handleClick = () => {
    toast.success("操作成功！", "您的更改已保存");
    toast.error("操作失败", "请稍后重试");
    toast.warning("注意", "此操作不可撤销");
    toast.info("提示", "新消息已到达");
  };
}
```

### Loading - 加载状态
```tsx
import { 
  PageLoading, 
  InlineLoading, 
  LoadingCard, 
  LoadingTable,
  LoadingGrid 
} from "@/components/ui";

// 全页加载
<PageLoading message="正在加载..." />

// 行内加载
<InlineLoading size="md" />

// 卡片骨架屏
<LoadingCard />

// 表格骨架屏
<LoadingTable rows={5} columns={4} />

// 网格骨架屏
<LoadingGrid count={6} columns={3} />
```

### Error - 错误状态
```tsx
import { 
  ErrorPage, 
  NotFoundPage, 
  NetworkErrorPage,
  InlineError,
  EmptyState 
} from "@/components/ui";

// 通用错误页
<ErrorPage
  title="出错了"
  message="抱歉，发生了一些错误"
  onRetry={() => window.location.reload()}
/>

// 404 页面
<NotFoundPage />

// 网络错误
<NetworkErrorPage onRetry={fetchData} />

// 行内错误
<InlineError message="加载失败" onRetry={retry} />

// 空状态
<EmptyState
  title="暂无房源"
  message="您还没有添加任何房源"
  action={<Button>添加房源</Button>}
/>
```

---

## 2. 布局组件

### Navbar - 导航栏
```tsx
import { Navbar } from "@/components/layout";

// 基础用法
<Navbar />

// 变体
<Navbar variant="light" />    // 白色背景
<Navbar variant="dark" />     // 深色背景
<Navbar variant="transparent" />  // 透明背景

// 隐藏联系信息
<Navbar showContact={false} />
```

### Footer - 页脚
```tsx
import { Footer } from "@/components/layout";

<Footer />
```

### Sidebar - 侧边栏（后台）
```tsx
import { Sidebar } from "@/components/layout";

// 基础用法
<Sidebar />

// 可折叠
<Sidebar
  isCollapsed={collapsed}
  onCollapseChange={setCollapsed}
/>
```

---

## 3. 后台管理组件

### AdminLayout - 后台布局
```tsx
import { AdminLayout } from "@/components/admin";

export default function AdminPage() {
  return (
    <AdminLayout
      title="仪表盘"
      breadcrumbs={[
        { label: "首页", href: "/admin" },
        { label: "仪表盘" },
      ]}
      actions={<Button>新建</Button>}
    >
      {/* 页面内容 */}
    </AdminLayout>
  );
}
```

### DashboardStats - 数据卡片
```tsx
import { DashboardStats, QuickStatsRow, ChartStats } from "@/components/admin";

// 默认统计卡片
<DashboardStats />

// 自定义统计
<DashboardStats
  stats={[
    {
      title: "总收入",
      value: "$100,000",
      trend: { value: 12, isPositive: true },
      icon: DollarSign,
      variant: "primary",
    },
  ]}
/>

// 快速统计行
<QuickStatsRow />

// 图表区域
<ChartStats title="收入趋势" subtitle="过去30天">
  {<MyChart />}
</ChartStats>
```

### DataTable - 数据表格
```tsx
import { DataTable } from "@/components/admin";

const columns = [
  { key: "name", header: "名称", sortable: true },
  { key: "email", header: "邮箱", sortable: true },
  { 
    key: "status", 
    header: "状态",
    render: (row) => <Badge>{row.status}</Badge>
  },
];

const data = [
  { id: 1, name: "张三", email: "zhang@example.com", status: "活跃" },
  { id: 2, name: "李四", email: "li@example.com", status: "离线" },
];

<DataTable
  data={data}
  columns={columns}
  keyExtractor={(row) => row.id.toString()}
  title="用户列表"
  searchable={true}
  pagination={true}
  pageSize={10}
  selectable={true}
  onRowClick={(row) => console.log(row)}
  onSelectionChange={(rows) => console.log(rows)}
/>
```

---

## 4. 基础 UI 组件（扩展）

### Button
```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="outline">边框按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="danger">危险按钮</Button>
<Button isLoading={true}>加载中</Button>
```

### Card
```tsx
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui";

<Card>
  <CardHeader><h3>标题</h3></CardHeader>
  <CardContent>内容</CardContent>
  <CardFooter>底部</CardFooter>
</Card>
```

### Input / TextArea / Select
```tsx
import { Input, TextArea, Select } from "@/components/ui";

<Input
  label="邮箱"
  placeholder="请输入邮箱"
  error="邮箱格式不正确"
  icon={<Mail />}
/>

<TextArea label="描述" rows={4} />

<Select
  label="选择类型"
  options={[
    { value: "1", label: "选项 1" },
    { value: "2", label: "选项 2" },
  ]}
/>
```

### Badge
```tsx
import { Badge } from "@/components/ui";

<Badge>默认</Badge>
<Badge variant="primary">主要</Badge>
<Badge variant="success">成功</Badge>
<Badge variant="warning">警告</Badge>
<Badge variant="error">错误</Badge>
```

### Modal
```tsx
import { Modal } from "@/components/ui";

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="对话框标题"
  footer={
    <>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>取消</Button>
      <Button onClick={handleConfirm}>确认</Button>
    </>
  }
  size="md"
>
  对话框内容
</Modal>
```

### Toggle / Checkbox / Radio
```tsx
import { Toggle, Checkbox, Radio } from "@/components/ui";

<Toggle
  checked={enabled}
  onChange={setEnabled}
  label="启用通知"
/>

<Checkbox label="同意条款" />

<Radio name="option" label="选项 A" />
```

### Avatar
```tsx
import { Avatar } from "@/components/ui";

<Avatar src="/avatar.jpg" alt="用户" size="md" />
<Avatar name="张三" size="lg" />  // 显示首字母
```

---

## 5. 使用最佳实践

### 主题配置
确保 `tailwind.config.ts` 中包含以下颜色配置：
```ts
colors: {
  primary: {
    DEFAULT: "#003B5C",
    50: "#E6F0F5",
    100: "#CCE0EB",
    // ...
  },
  accent: {
    DEFAULT: "#C9A962",
    // ...
  },
}
```

### 响应式设计
所有组件都支持响应式设计，使用 Tailwind 的断点前缀：
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

### 无障碍支持
- 所有交互组件支持键盘导航
- 适当的 ARIA 属性
- 焦点状态样式

---

## 6. 文件结构

```
src/components/
├── ui/                    # UI 组件库
│   ├── index.tsx         # 统一导出
│   ├── Button.tsx
│   ├── DatePicker.tsx    # 新增
│   ├── RangeSlider.tsx   # 新增
│   ├── Accordion.tsx     # 新增
│   ├── Tabs.tsx          # 新增
│   ├── Toast.tsx         # 新增
│   ├── Loading.tsx       # 新增
│   ├── Error.tsx         # 新增
│   ├── Modal.tsx
│   └── ...
├── layout/               # 布局组件
│   ├── index.tsx
│   ├── Navbar.tsx        # 更新
│   ├── Footer.tsx        # 新增
│   └── Sidebar.tsx       # 新增
├── admin/                # 后台组件
│   ├── index.tsx
│   ├── AdminLayout.tsx   # 新增
│   ├── DashboardStats.tsx # 新增
│   └── DataTable.tsx     # 新增
└── ...
```
