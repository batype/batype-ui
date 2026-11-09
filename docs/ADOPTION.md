# 后台渐进接入兼容

本页介绍0.4.0的组件库接入能力，未批量替换 jiujiu-manager 页面。SDK、权限、路由及金额/时区规则仍由应用负责。实际发布状态以npm注册表为准。

## 1. Provider 与第三方弹出层

应用入口使用 UIProvider，并把现有 next-themes 的 resolvedTheme、i18next 的语言映射到 theme/locale，避免维护两份主题状态。保留当前 HeroUIProvider、Ant Design ConfigProvider；无需一次删除旧组件。

原生 dialog 的顶层无法用 z-index 从外部跨越。Ant Design 控件应放在弹窗**内部**的可选桥接层中：

```tsx
import { DetailModal } from '@batype/ui'
import { AntdCompatibilityProvider, AntdForm, AntdSelect, useAntdApp } from '@batype/ui/antd'

;<DetailModal isOpen={open} onClose={close} title="编辑商品">
  <AntdCompatibilityProvider>
    <ExistingProductForm />
  </AntdCompatibilityProvider>
</DetailModal>
```

`AntdForm`、`AntdSelect`、`AntdDatePicker`、`AntdInputNumber`是原组件的再导出，支持 `Form.useForm()`、`setFieldsValue`、`resetFields`、`isFieldTouched`、嵌套字段、`Form.List`、多选及日期时间。不要把现有复杂表单批量换成本库的简易 Form。

在 ExistingProductForm 内用 `useAntdApp().message/notification`，不要继续调用脱离上下文的静态 message。桥接层会将这些弹出节点与下拉框放入当前 dialog，弹窗外仍继承原主题/语言配置。该入口要求应用安装可选 peer `antd`；主入口没有 Ant Design 依赖。

该可选入口沿用后台现有的`skipLibCheck: true`：Ant Design/rc-picker部分上游声明在严格检查React 18依赖时有类型错误。消费测试只对该入口跳过依赖声明检查，仍严格检查应用参数；核心、编辑器与Markdown保持完整严格检查。验证版本为Ant Design 5.29.0与后台实际6.4.3。

其他 Portal 库用 `usePopupContainer()` 获取当前容器，例如 HeroUI 的 `portalContainer={container}`。按触发节点计算容器的库也可以使用 `getPopupContainer(trigger)`。Hook须在DetailModal内部的子组件中调用；在Modal外调用无法得到其内部容器。Tooltip、日期弹层等需遵循同样的容器约定。

## 2. 保留旧组件入口

`adaptLegacyAction`、`adaptLegacyTable`、`adaptLegacyPagination`从主入口导出，允许后台保留当前封装文件和绝大多数调用方式。完整可编译示例见 `docs/examples/ManagerAdapters.tsx`。

| 适配器                  | 约定                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| adaptLegacyAction       | 显式传 allowed；调用方按原逻辑计算删除权限。tooltip→label，color→tone，icon继续传现有NextIcon节点。拒绝权限时返回null，不能把null转换成空props后继续渲染按钮。  |
| adaptLegacyTable        | renderCell转换到逐列render；actions列自动隐藏移动标签并整行展示。保留列style及移动类名。rowKey优先于_key，未给时仅回退id/orderId，0有效，拒绝数组下标作为标识。 |
| adaptLegacyTable 的全选 | selectedKeys='all'时必须传allSelectionKeys，应用明确给出全选范围。普通表头全选仅影响当前传入items，保留其他页已选键。禁止把当前页自动解释成全部后端记录。       |
| adaptLegacyPagination   | onChange转onPageChange。onPageSizeChange接收旧式(page,size)，修改size时明确回调(1,size)，配合现有usePagination回到第一页；保留5/10/20/50。                      |

同名 props 并不意味着可直接换 import。原 HeroUI 的 `onPress`、`isDisabled`、`isLoading` 等仍需映射到原生 Button API。

旧详情若希望空字段继续展示，使用 `hideEmpty={false}`、`emptyValue="-"`；默认详情行为保持不变。原项目超大弹窗尺寸需要逐处核对，本库目前支持sm/md/lg。

## 3. 日期时间和时区

DatePicker/DateRangePicker支持 `showTime`，此时使用原生 `datetime-local`。`step={1}`支持秒；值为 `YYYY-MM-DDTHH:mm[:ss]`，清空为 `''`。默认日期模式继续使用`YYYY-MM-DD`。

不接受Dayjs对象或带Z的UTC字符串，不擅自调用toISOString。原使用Dayjs的复杂表单可保留可选入口的AntdDatePicker；需要迁移原生控件时，在应用边界明确做北京时间/接口格式的转换。

## 4. 富文本

```tsx
<RichTextEditor
  value={html}
  onChange={setHtml}
  label="通知正文"
  mode="default"
  hoverbarPlacement="below"
  lineHeight={1.5}
  uploadImage={uploadImageThroughApplicationSDK}
/>
```

simple仍是原有默认工具栏模式；后台可选default获得完整工具栏。选中多行时优先将浮动工具栏放在整个选区下方；空间不足时放在上方。受控HTML正常回传不调用setHtml，保留光标和选区。段落默认无额外上下间距，行高1.5；历史HTML显式内联样式继续保留。

上传仍由应用适配；默认限制10MB图片，可用maxImageSize修改。mode切换会重建编辑器并重置撤销历史；需要更改初始化toolbarKeys/uploadImage能力时仍使用key重建。HTML的保存/展示沿用应用和后端净化规则。

## 5. Markdown依赖

可选Markdown入口同时接受`react-markdown ^9.0.1 || ^10.1.0`，原后台9.x无需为了核心UI接入而升级。消费测试分别覆盖9.1.0和10.1.0；主入口不会加载Markdown引擎。

## 采用顺序

先接入Provider与旧封装，再选择普通列表页试点；检查桌面/手机、权限、批量操作、URL分页和空数据。随后处理上传和详情。复杂表单沿用Ant Design兼容入口，路由/SDK/权限不进入组件库。
