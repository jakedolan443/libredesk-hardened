export const FILTER_KEYS = ['status', 'inbox', 'created']

export const emptyFilters = () => ({
  status: '',
  inbox: '',
  created: ''
})

export const filtersFromQuery = (query) => {
  const filters = emptyFilters()
  for (const key of FILTER_KEYS) {
    const raw = query[key]
    if (raw === undefined || raw === null || raw === '') continue
    filters[key] = String(raw)
  }
  return filters
}

export const queryFromFilters = (filters) => {
  const query = {}
  for (const key of FILTER_KEYS) {
    const value = filters[key]
    if (value) {
      query[key] = value
    }
  }
  return query
}

export const hasActiveFilters = (filters) => FILTER_KEYS.some((key) => Boolean(filters[key]))

const leaf = (field, operator, value = '') => ({
  model: 'conversations',
  field,
  operator,
  value: String(value)
})

export const toFiltersJSON = (filters) => {
  const rules = []
  if (filters.status) rules.push(leaf('status_id', 'equals', filters.status))
  if (filters.inbox) rules.push(leaf('inbox_id', 'equals', filters.inbox))
  if (filters.created) rules.push(leaf('created_at', 'between', filters.created))
  return rules.length ? JSON.stringify(rules) : ''
}
