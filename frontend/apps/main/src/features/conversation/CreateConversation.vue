<template>
  <div>
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {{ $t('conversation.newConversation') }}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <form @submit="createConversation" novalidate class="flex flex-col flex-1 overflow-hidden">
          <!-- Form Fields Section -->
          <div class="space-y-4 pb-2 flex-shrink-0">
            <div class="space-y-2">
              <FormField v-slot="{ componentField }" name="email">
                <FormItem
                  ><FormLabel>To</FormLabel
                  ><FormControl>
                    <Input
                      ref="emailInputRef"
                      type="email"
                      placeholder="recipient@example.com"
                      v-bind="componentField"
                      autocomplete="off"
                    /> </FormControl
                  ><FormMessage
                /></FormItem>
              </FormField>

              <!-- Subject and Inbox Group -->
              <div class="grid grid-cols-2 gap-4">
                <FormField v-slot="{ componentField }" name="subject">
                  <FormItem>
                    <FormLabel>{{ $t('globals.terms.subject') }}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="inbox_id">
                  <FormItem>
                    <FormLabel>{{ $t('globals.terms.inbox') }}</FormLabel>
                    <FormControl>
                      <Select v-bind="componentField">
                        <SelectTrigger>
                          <SelectValue :placeholder="t('placeholders.selectInbox')" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem
                              v-for="option in inboxStore.emailOptions"
                              :key="option.value"
                              :value="option.value"
                            >
                              {{ option.label }}
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>
          </div>

          <!-- Message Editor Section -->
          <div class="flex-1 flex flex-col min-h-0 mt-4">
            <FormField v-slot="{ componentField }" name="content">
              <FormItem class="flex flex-col h-full">
                <FormLabel>{{ $t('globals.terms.message') }}</FormLabel>
                <FormControl class="flex-1 flex flex-col min-h-0">
                  <div class="flex flex-col h-full">
                    <Editor
                      v-model:htmlContent="componentField.modelValue"
                      @update:htmlContent="(value) => componentField.onChange(value)"
                      :placeholder="t('globals.terms.typeMessage')"
                      :insertContent="insertContent"
                      :autoFocus="false"
                      :enableInlineImages="true"
                      class="w-full flex-1 overflow-y-auto p-2 box min-h-0"
                      @send="createConversation"
                      @filesDropped="uploadFiles"
                    />

                    <ReplyBoxAttachmentPreview
                      :attachments="mediaFiles"
                      :uploadingFiles="uploadingFiles"
                      :onDelete="handleFileDelete"
                      v-if="mediaFiles.length > 0 || uploadingFiles.length > 0"
                      class="mt-2 flex-shrink-0"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <DialogFooter class="mt-4 pt-2 flex items-center !justify-between w-full flex-shrink-0">
            <ReplyBoxMenuBar
              :handleFileUpload="handleFileUpload"
              @emojiSelect="handleEmojiSelect"
              :showSendButton="false"
            />
            <Button type="submit" :disabled="isDisabled" :isLoading="loading">
              {{ $t('globals.messages.submit') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@shared-ui/components/ui/dialog'
import { Button } from '@shared-ui/components/ui/button'
import { Input } from '@shared-ui/components/ui/input'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@shared-ui/components/ui/form'
import { z } from 'zod'
import { ref, onUnmounted, nextTick, onMounted, computed } from 'vue'
import ReplyBoxAttachmentPreview from '@/features/conversation/message/attachment/ReplyBoxAttachmentPreview.vue'

import ReplyBoxMenuBar from '@/features/conversation/ReplyBoxMenuBar.vue'
import { EMITTER_EVENTS } from '@main/constants/emitterEvents.js'
import { useEmitter } from '@main/composables/useEmitter'
import { handleHTTPError } from '@shared-ui/utils/http.js'
import { useInboxStore } from '@main/stores/inbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@shared-ui/components/ui/select'
import { useI18n } from 'vue-i18n'
import { useFileUpload } from '@/composables/useFileUpload'
import Editor from '@/components/editor/ConversationEditor.vue'
import { UserTypeAgent } from '@/constants/user'

import { hasPendingInlineUpload } from '@main/composables/useInlineImageUpload'

const dialogOpen = defineModel({
  required: false,
  default: () => false
})

const inboxStore = useInboxStore()
const { t } = useI18n()
const emitter = useEmitter()
const loading = ref(false)

const insertContent = ref('')
const emailInputRef = ref(null)

const handleEmojiSelect = (emoji) => {
  insertContent.value = undefined
  // Force reactivity so the user can select the same emoji multiple times
  nextTick(() => (insertContent.value = emoji))
}

const {
  uploadingFiles,
  handleFileUpload,
  handleFileDelete,
  uploadFiles,
  mediaFiles,
  clearMediaFiles
} = useFileUpload({
  linkedModel: 'messages'
})

const isDisabled = computed(() => {
  if (loading.value || uploadingFiles.value.length > 0) return true
  if (hasPendingInlineUpload(form?.values?.content)) return true
  return false
})

const formSchema = z.object({
  subject: z.string().min(1, t('validation.subjectCannotBeEmpty')),
  content: z.string().min(1, t('validation.messageCannotBeEmpty')),
  inbox_id: z
    .any()
    .refine((val) => inboxStore.emailOptions.some((option) => option.value === val), {
      message: t('globals.messages.required')
    }),
  email: z.string().email(t('validation.invalidEmail'))
})

onUnmounted(() => {
  clearMediaFiles()
})

onMounted(() => {
  nextTick(() => {
    emailInputRef.value?.$el?.focus()
  })
})

const form = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    inbox_id: null,
    subject: '',
    content: '',
    email: ''
  }
})

const createConversation = form.handleSubmit(async (values) => {
  loading.value = true
  try {
    // Convert ids to numbers if they are not already
    values.inbox_id = Number(values.inbox_id)
    values.attachments = mediaFiles.value.map((file) => file.id)
    // Initiator of this conversation is always agent
    values.initiator = UserTypeAgent

    dialogOpen.value = false
    form.resetForm()
  } catch (error) {
    emitter.emit(EMITTER_EVENTS.SHOW_TOAST, {
      variant: 'destructive',
      description: handleHTTPError(error).message
    })
  } finally {
    loading.value = false
  }
})
</script>
