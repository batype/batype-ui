# 从 jiujiu-manager 渐进接入

接入阻碍的兼容处理、可选Ant Design入口和适配器见 [后台渐进接入兼容](ADOPTION.md)。

新增通用表单、消息、筛选与裁剪组件的边界和接入方式见 [通用组件补齐](COMPLETION.md)。原后台尚未自动替换为本库。

本次只创建独立库，没有替换原后台组件。不要直接替换整个 `components` 目录。

1. 先通过tarball在独立消费项目验证，然后选择低风险展示页试点。
2. 引入一次样式和UIProvider；通过tokens匹配现有品牌，避免全局覆盖原主题。
3. 保留SDK、usePermission、路由、格式化和错误处理在调用页面。
4. 对目标页的桌面/手机、长文本、加载、失败、权限、键盘行为回归后再扩大范围。

| 旧接口                                   | 新接口/变化                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| Button `color`                           | `tone`；旧 default 对应 neutral                                        |
| HeroUI `onPress`                         | 原生 `onClick`                                                         |
| ActionButton `icon="delete"`、`tooltip`  | `icon={<NextIcon type="delete" />}`、`label`；是否显示由调用方权限决定 |
| Input `onValueChange(value)`             | `onChange(event)`，读取 event.target.value                             |
| StatusChip map 的 color                  | tone；状态映射继续由业务维护                                           |
| NextTable `_key` / index回退             | 显式 rowKey，必须稳定唯一                                              |
| NextTable `renderCell(item,columnKey)`   | 每列 render(row)                                                       |
| HeroUI selectedKeys="all"                | 使用显式 Set；服务端跨页全选要在业务定义集合/范围                      |
| NextPagination `onChange`                | onPageChange；onPageSizeChange只传size                                 |
| DetailModal `isOpen/onClose/data/fields` | 保留此模式；尺寸限定sm/md/lg，其他布局用children/extra                 |
| 私有iconfont                             | 原后台可通过icon槽继续传其NextIcon；公共库本身不携带字体               |

```tsx
// 在业务页面中判断权限；库只负责UI。
{
  canDelete && (
    <ActionButton
      label="删除记录"
      tone="danger"
      icon={<NextIcon type="delete" />}
      onClick={() => openBusinessDeleteDialog(row)}
    />
  )
}
```

这并不把前端隐藏按钮当作安全边界，服务端仍须独立校验权限。

## 0.2 新增能力

上传改为调用方适配器；原OSS地址不进入公共包。CodeEditor/RichTextEditor从`@batype/ui/editors`引入并安装可选peer；Markdown从`@batype/ui/markdown`引入。NavigationMenu/RouteTabs只产生key事件，原路由和关闭跳转策略继续放在应用中。TreeTable使用getChildren和稳定rowKey。文档地址从大类别改成`#Button`、`#TreeTable`等组件名，支持直接访问和搜索。
