<template>
  <div class="email-envelope mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
    <span v-if="subject" class="basis-full text-foreground font-medium">
      {{ subject }}
    </span>
    <span class="whitespace-nowrap">
      <span class="text-muted-foreground">From:</span> {{ from.join(', ') || '—' }}
    </span>
    <span class="whitespace-nowrap">
      <span class="text-muted-foreground">To:</span> {{ to.join(', ') || '—' }}
    </span>
    <span v-if="cc.length" class="whitespace-nowrap">
      <span class="text-muted-foreground">Cc:</span> {{ cc.join(', ') }}
    </span>
    <span v-if="bcc.length" class="whitespace-nowrap">
      <span class="text-muted-foreground">Bcc:</span> {{ bcc.join(', ') }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConversationStore } from '@main/stores/conversation'

const conversationStore = useConversationStore()

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const meta = computed(() => props.message.meta || {})
const currentConversation = computed(() => conversationStore.current || {})

const asList = (value) => (Array.isArray(value) ? value.filter(Boolean) : [])

const subject = computed(() => meta.value.subject || currentConversation.value.subject || '')

const from = computed(() => {
  const explicitFrom = asList(meta.value.from)
  if (explicitFrom.length) return explicitFrom

  if (props.message.type === 'incoming') {
    return [props.message.author?.email, currentConversation.value.contact?.email].filter(Boolean)
  }

  return [currentConversation.value.inbox_mail || currentConversation.value.inbox_reply_to].filter(
    Boolean
  )
})

const to = computed(() => {
  const explicitTo = asList(meta.value.to)
  if (explicitTo.length) return explicitTo

  if (props.message.type === 'incoming') {
    return [currentConversation.value.inbox_mail || currentConversation.value.inbox_reply_to].filter(
      Boolean
    )
  }

  return [currentConversation.value.contact?.email].filter(Boolean)
})

const cc = computed(() => asList(meta.value.cc))
const bcc = computed(() => asList(meta.value.bcc))
</script>
