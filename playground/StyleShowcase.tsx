import { useState } from 'react'
import {
  UIProvider,
  Card,
  Input,
  PasswordInput,
  Select,
  SearchSelect,
  DatePicker,
  NumberInput,
  Button,
  ActionButton,
  Icon,
  Badge,
  Checkbox,
  Switch,
  Dropdown,
  type Tone,
} from '../src'

const tones: Tone[] = ['neutral', 'primary', 'success', 'warning', 'danger']
const options = [
  { value: 'enabled', label: '正常' },
  { value: 'disabled', label: '已停用' },
]

/** The same controls side by side make visual drift and density differences visible. */
export default function StyleShowcase() {
  const [value, setValue] = useState('enabled')
  const [amount, setAmount] = useState<number | null>(100)
  return (
    <div className="style-showcase">
      {(['light', 'dark'] as const).flatMap((theme) =>
        (['comfortable', 'compact'] as const).map((density) => (
          <UIProvider
            key={`${theme}-${density}`}
            theme={theme}
            density={density}
            data-testid={`style-${theme}-${density}`}
          >
            <Card
              title={`${theme === 'light' ? '浅色' : '深色'} · ${density === 'compact' ? '紧凑 32px' : '标准 40px'}`}
            >
              <div className="style-showcase__fields">
                <Input label="账号" placeholder="请输入账号…" name="account" autoComplete="off" />
                <Select
                  label="状态"
                  options={options}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
                <SearchSelect
                  label="搜索状态"
                  options={options}
                  value={value}
                  onChange={setValue}
                />
                <NumberInput label="数量" value={amount} onChange={setAmount} />
                <DatePicker label="日期" defaultValue="2026-11-10" />
                <PasswordInput
                  label="口令"
                  defaultValue="example-password"
                  autoComplete="new-password"
                />
              </div>
              <div className="bui-action-group style-showcase__row">
                <Button>主要操作</Button>
                <Button tone="neutral">取消</Button>
                <Button variant="soft">次要操作</Button>
                <Dropdown
                  label="更多操作"
                  items={[{ key: 'view', label: '查看详情' }]}
                  onSelect={() => {}}
                />
              </div>
              <div className="bui-action-group style-showcase__row" aria-label="操作按钮与状态">
                {tones.map((tone) => (
                  <ActionButton
                    key={tone}
                    label={`${tone} 操作`}
                    tone={tone}
                    icon={<Icon name="check" />}
                  />
                ))}
              </div>
              <div className="bui-action-group style-showcase__row">
                {tones.map((tone) => (
                  <Badge key={tone} tone={tone}>
                    {tone}
                  </Badge>
                ))}
              </div>
              <div className="bui-action-group style-showcase__row">
                <Checkbox label="已勾选" defaultChecked />
                <Switch label="启用" defaultChecked />
              </div>
              <Input label="错误状态" error="请填写有效内容" defaultValue="待修正内容" />
            </Card>
          </UIProvider>
        )),
      )}
    </div>
  )
}
