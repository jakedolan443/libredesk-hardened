<template>
  <div class="email-envelope mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
    <span v-if="message.meta.subject" class="basis-full text-foreground font-medium">
      {{ message.meta.subject }}
    </span>
    <span v-if="message.meta.from?.length" class="whitespace-nowrap">
      <span class="text-muted-foreground">From:</span> {{ message.meta.from.join(', ') }}
    </span>
    <span v-if="message.meta.to?.length" class="whitespace-nowrap">
      <span class="text-muted-foreground">To:</span> {{ message.meta.to.join(', ') }}
    </span>
    <span v-if="message.meta.cc?.length" class="whitespace-nowrap">
      <span class="text-muted-foreground">Cc:</span> {{ message.meta.cc.join(', ') }}
    </span>
    <span v-if="message.meta.bcc?.length" class="whitespace-nowrap">
      <span class="text-muted-foreground">Bcc:</span> {{ message.meta.bcc.join(', ') }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: Object,
    required: true
  }
})
</script>
