<template>
  <div
    role="toolbar"
    :aria-label="t('conversation.bulkActions.toolbar')"
    class="p-2 flex items-center gap-1 bg-muted/30"
  >
    <Checkbox
      :checked="conversationStore.allSelected"
      @update:checked="toggleSelectAll"
      :aria-label="t('conversation.bulkActions.selectAll')"
      class="ml-1 mr-1"
    />
    <span
      class="text-xs font-medium whitespace-nowrap tabular-nums inline-block min-w-20 mr-1"
      aria-live="polite"
    >
      {{
        t('conversation.bulkActions.selected', conversationStore.selectedCount, {
          count: conversationStore.selectedCount
        })
      }}
    </span>

    <!-- Assign Agent -->

    <!-- Assign Team -->

    <!-- Add Tag -->

    <!-- Set Status -->
    <DropdownMenu v-if="canUpdateStatus">
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          :disabled="bulkLoading"
          :title="t('actions.setStatus')"
          :aria-label="t('actions.setStatus')"
        >
          <CircleDot class="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          v-for="status in conversationStore.statusOptionsNoSnooze"
          :key="status.value"
          @click="bulkUpdateStatus(status.label)"
        >
          {{ status.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Loader2 v-if="bulkLoading" class="w-4 h-4 animate-spin text-muted-foreground ml-2" />

    <Button
      variant="ghost"
      size="icon"
      class="ml-auto"
      :aria-label="t('conversation.bulkActions.clearSelection')"
      @click="conversationStore.clearSelection()"
    >
      <X class="w-4 h-4" />
    </Button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { CircleDot, Loader2, X } from 'lucide-vue-next'
import { Button } from '@shared-ui/components/ui/button'
import { Checkbox } from '@shared-ui/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@shared-ui/components/ui/dropdown-menu'

import { useConversationStore } from '@/stores/conversation'
import { useBulkActionPermissions } from '@/composables/useBulkActionPermissions'
import { useBulkActions } from '@/composables/useBulkActions'

const conversationStore = useConversationStore()
const { t } = useI18n()
const { bulkLoading, bulkUpdateStatus } = useBulkActions()

const { canUpdateStatus } = useBulkActionPermissions()

const toggleSelectAll = () => {
  if (conversationStore.allSelected) {
    conversationStore.clearSelection()
  } else {
    conversationStore.selectAll()
  }
}
</script>
