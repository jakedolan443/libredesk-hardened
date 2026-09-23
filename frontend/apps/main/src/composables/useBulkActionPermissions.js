import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { permissions as p } from '@/constants/permissions'

export function useBulkActionPermissions() {
  const userStore = useUserStore()

  const canUpdateStatus = computed(() => userStore.can(p.CONVERSATIONS_UPDATE_STATUS))

  const canBulkAct = computed(() => canUpdateStatus.value)

  return { canUpdateStatus, canBulkAct }
}
