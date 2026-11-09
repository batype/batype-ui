# 通用组件补齐

0.4.0接入兼容能力见 [后台渐进接入兼容](ADOPTION.md)：可选Ant Design桥接层、旧按钮/表格/分页参数适配、日期时间、富文本定制及Markdown 9/10兼容。

本轮在保持旧接口兼容的前提下新增12个组件，目录共57项；仅修改UI库，不接入后台SDK。正式发布按RELEASING.md执行，组件实现和本地测试不会自动发布npm。

## 新增入口

全部从 `@batype/ui` 导入，仍需 `UIProvider` 和 `@batype/ui/style.css`。

- `MessageProvider` + `useMessage`：局部消息容器、加载更新、定时关闭、悬停及焦点暂停。
- `Form` / `FormField` / `FormList`：状态、异步校验、提交防重、重置、动态列表增删移位。
- `SearchSelect`：搜索、键盘候选、禁用项、清空。旧 `Select` 保持原生事件接口。
- `Cascader`：受控路径与父子联动，不内置行政区或分类数据。
- `DatePicker` / `DateRangePicker`：浏览器原生日历和日期字符串范围，不自动转换时区。
- `NumberInput`：number/null，失焦精度及范围处理；不用于任意精度金融运算。
- `RadioGroup`：原生单选分组及禁用状态。
- `ImageCropper`：本地比例、缩放、偏移和Canvas导出，无上传服务。
- `PageHeader`：标题、说明、面包屑和操作插槽。

各组件的完整可编译示例见 `docs/examples/`；参数和默认值见生成的 `docs/API.md`。

## 原组件增强

### 上传前处理

`FileUpload`、`ImageUpload`、`VideoUpload` 的可选 `beforeUpload(file, {signal})` 返回处理后的 `File`，或返回 `null` 取消。调用方可在适配器内等待 `ImageCropper.onCrop`，并在关闭裁剪时resolve(null)。

处理期间条目状态为 `processing`。结果仍检查大小和accept，之后才调用upload。移除或卸载会中止signal；适配器应监听signal取消自己的交互/计算，迟到结果不会重新插入条目。没有upload时只保留selected状态，不假报上传完成。

### 移动表格操作区

```tsx
const columns = [
  { key: 'name', title: '名称' },
  {
    key: 'actions',
    title: '操作',
    kind: 'actions' as const,
    render: (row) => <Button onClick={() => view(row)}>查看</Button>,
  },
]
```

`kind="actions"` 在移动卡片中隐藏列标题，操作区占满整行并允许换行；桌面仍保留表头。普通列也可用 `mobileLabel={false}` 隐藏标签。旧列定义不改变显示。

## 边界

- 表单字段为顶层key，动态数组通过FormList管理；不冒充完整Ant Design Form兼容层。
- 日期使用系统控件，不提供自绘月历、时刻或时区转换。
- 不迁入权限、软删除、登录、支付、路由或业务校验。
- 编辑器更多语言与Markdown公式仍为后续可选增强；多行选区浮动工具栏避让已在0.4.0补齐。
- 构建、测试结果以本次实际运行输出为准；不表示已发布或覆盖全部浏览器。
