import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CircleDot, X } from 'lucide-vue-next'
import { useConversationStore } from '@main/stores/conversation'

import { useBulkActions } from '@main/composables/useBulkActions'
import { permissions as perms } from '@main/constants/permissions'
import { SECTIONS } from '../sections'

export function useBulkCommands() {
  const { t } = useI18n()
  const conversationStore = useConversationStore()

  const { bulkUpdateStatus } = useBulkActions()

  const section = SECTIONS.BULK

  return computed(() => {
    if (conversationStore.selectedCount === 0) return []
    return [
      {
        id: 'bulk.status',
        label: t('actions.setStatus'),
        keywords: [t('globals.terms.status')],
        section,
        icon: CircleDot,
        permission: perms.CONVERSATIONS_UPDATE_STATUS,
        group: true
      },
      ...conversationStore.statusOptionsNoSnooze.map((status) => ({
        id: `bulk.status.${status.value}`,
        label: status.label,
        parent: 'bulk.status',
        icon: CircleDot,
        run: () => bulkUpdateStatus(status.label)
      })),

      {
        id: 'bulk.clear',
        label: t('conversation.bulkActions.clearSelection'),
        keywords: ['deselect'],
        section,
        icon: X,
        run: () => conversationStore.clearSelection()
      }
    ]
  })
}
