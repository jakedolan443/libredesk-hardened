import { useRouter } from 'vue-router'
import { MessageSquare } from 'lucide-vue-next'

import api from '@main/api'
import { SECTIONS } from '../sections'

export const ENTITY_SEARCH_MIN_LENGTH = 3

const RESULT_LIMIT = 10

// Root-level searches that turn typed text into matching records, alongside the static commands.
export function useEntitySearch() {
  const router = useRouter()

  const searchConversations = async (term) => {
    const response = await api.searchConversations({ query: term, page_size: RESULT_LIMIT })
    return (response.data.data?.results || []).map((conversation) => ({
      id: `search.conversation.${conversation.uuid}`,
      label: conversation.subject || `#${conversation.reference_number}`,
      hint: `#${conversation.reference_number} · ${conversation.status}`,
      section: SECTIONS.CONVERSATION_RESULTS,
      icon: MessageSquare,
      run: () =>
        router.push({
          name: 'inbox-conversation',
          params: { type: 'all', uuid: conversation.uuid }
        })
    }))
  }

  const search = async (term) => {
    const results = await Promise.allSettled([searchConversations(term)])
    return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
  }

  return { search }
}
