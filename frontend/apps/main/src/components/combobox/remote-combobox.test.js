import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

const ensureUserIDs = vi.fn()
const childProps = { modelValue: undefined }

const ChildStub = defineComponent({
  props: { modelValue: { type: [String, Number, Array], default: undefined } },
  setup(props) {
    childProps.modelValue = props.modelValue
    return () => h('div')
  }
})

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key) => key }) }))
vi.mock('@shared-ui/components/ui/select', () => ({ SelectTag: ChildStub }))
vi.mock('@/components/combobox/SelectCombobox.vue', () => ({ default: ChildStub }))
vi.mock('@/stores/users', () => ({
  useUsersStore: () => ({ options: [], fetchUsers: vi.fn(), searchUsers: vi.fn(), ensureUserIDs })
}))
vi.mock('@/stores/user', () => ({ useUserStore: () => ({ userID: 1 }) }))

const SelectAgentCombobox = (await import('./SelectAgentCombobox.vue')).default

const renderWithKebabModelValue = (component, props) =>
  renderToString(createSSRApp(defineComponent({ render: () => h(component, props) })))

describe('remote comboboxes with a kebab-case model-value', () => {
  beforeEach(() => {
    ensureUserIDs.mockClear()
    childProps.modelValue = undefined
  })

  it('pins the selected agent id', async () => {
    await renderWithKebabModelValue(SelectAgentCombobox, { 'model-value': 42 })
    expect(ensureUserIDs).toHaveBeenCalledWith([42])
    expect(childProps.modelValue).toBe(42)
  })

  it('leaves the child model value untouched when no value is given', async () => {
    await renderWithKebabModelValue(SelectAgentCombobox, {})
    expect(childProps.modelValue).toBeUndefined()
  })
})
