import { computed } from 'vue'

import { useI18n } from 'vue-i18n'
import {
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Download,
  Link2,
  MailOpen,
  MessageSquare,
  PenLine,
  RotateCcw,
  StickyNote
} from 'lucide-vue-next'
import { useConversationStore } from '@main/stores/conversation'

import { useEmitter } from '@main/composables/useEmitter'
import { EMITTER_EVENTS, CONVERSATION_ACTIONS } from '@main/constants/emitterEvents'
import { permissions as perms } from '@main/constants/permissions'
import { CONVERSATION_DEFAULT_STATUSES } from '@main/constants/conversation'

import { SECTIONS } from '../sections'

export const SNOOZE_COMMAND = 'conv.snooze'
export const SNOOZE_CUSTOM_COMMAND = 'conv.snooze.custom'

const SNOOZE_PRESETS = [
  { minutes: 60, unitKey: 'globals.terms.hour', count: 1 },
  { minutes: 180, unitKey: 'globals.terms.hour', count: 3 },
  { minutes: 360, unitKey: 'globals.terms.hour', count: 6 },
  { minutes: 720, unitKey: 'globals.terms.hour', count: 12 },
  { minutes: 1440, unitKey: 'globals.terms.day', count: 1 },
  { minutes: 2880, unitKey: 'globals.terms.day', count: 2 },
  { minutes: 4320, unitKey: 'globals.terms.day', count: 3 },
  { minutes: 10080, unitKey: 'globals.terms.week', count: 1 }
]

const REOPENABLE_STATUSES = [
  CONVERSATION_DEFAULT_STATUSES.RESOLVED,
  CONVERSATION_DEFAULT_STATUSES.CLOSED,
  CONVERSATION_DEFAULT_STATUSES.SNOOZED
]

export const formatSnoozeDuration = (minutes) =>
  minutes % 60 === 0 && minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`

export function useConversationCommands({ openSnoozeDatePicker }) {
  const { t } = useI18n()
  const emitter = useEmitter()
  const conversationStore = useConversationStore()

  const section = SECTIONS.CONVERSATION

  const snoozeCommands = () => [
    {
      id: SNOOZE_COMMAND,
      label: t('globals.terms.snooze'),
      section,
      icon: CalendarClock,
      permission: perms.CONVERSATIONS_UPDATE_STATUS,
      group: true,

      placeholder: t('command.snoozeFor')
    },
    ...SNOOZE_PRESETS.map(({ minutes, unitKey, count }) => ({
      id: `conv.snooze.${minutes}`,
      label: `${count} ${t(unitKey, count)}`,
      parent: SNOOZE_COMMAND,
      icon: CalendarClock,
      run: () => conversationStore.snoozeConversation(formatSnoozeDuration(minutes))
    })),
    {
      id: SNOOZE_CUSTOM_COMMAND,
      label: t('globals.messages.pickDateAndTime'),
      parent: SNOOZE_COMMAND,
      icon: CalendarClock,
      run: openSnoozeDatePicker
    }
  ]

  const statusCommands = (conv) => {
    const commands = []
    const current = conv.status
    if (current !== CONVERSATION_DEFAULT_STATUSES.RESOLVED) {
      commands.push({
        id: 'conv.resolve',
        label: t('globals.terms.resolve'),
        keywords: ['close', 'done'],
        section,
        icon: CheckCircle2,
        permission: perms.CONVERSATIONS_UPDATE_STATUS,

        run: () => conversationStore.updateStatus(CONVERSATION_DEFAULT_STATUSES.RESOLVED)
      })
    }
    if (REOPENABLE_STATUSES.includes(current)) {
      commands.push({
        id: 'conv.reopen',
        label: t('globals.terms.reopen'),
        keywords: [t('globals.terms.open')],
        section,
        icon: RotateCcw,
        permission: perms.CONVERSATIONS_UPDATE_STATUS,

        run: () => conversationStore.updateStatus(CONVERSATION_DEFAULT_STATUSES.OPEN)
      })
    }
    commands.push(...snoozeCommands())
    commands.push({
      id: 'conv.status',
      label: t('actions.setStatus'),
      keywords: [t('globals.terms.status')],
      section,
      icon: CircleDot,
      permission: perms.CONVERSATIONS_UPDATE_STATUS,
      group: true
    })
    for (const status of conversationStore.statusOptions) {
      if (status.label === current) continue
      const isSnooze = status.label === CONVERSATION_DEFAULT_STATUSES.SNOOZED
      commands.push({
        id: `conv.status.${status.value}`,
        label: status.label,
        parent: 'conv.status',
        icon: isSnooze ? CalendarClock : CircleDot,
        navigateTo: isSnooze ? SNOOZE_COMMAND : undefined,
        run: isSnooze ? undefined : () => conversationStore.updateStatus(status.label)
      })
    }
    return commands
  }

  const composeCommands = () => [
    {
      id: 'conv.reply',
      label: t('command.switchToReply'),
      keywords: [t('globals.terms.reply')],
      section,
      icon: MessageSquare,
      permission: perms.MESSAGES_WRITE,

      run: () => emitter.emit(EMITTER_EVENTS.REPLY_BOX_SET_TYPE, 'reply')
    },
    {
      id: 'conv.private-note',
      label: t('command.switchToPrivateNote'),
      keywords: [t('globals.terms.privateNote'), t('globals.terms.note')],
      section,
      icon: StickyNote,
      permission: perms.MESSAGES_WRITE_PRIVATE,

      run: () => emitter.emit(EMITTER_EVENTS.REPLY_BOX_SET_TYPE, 'private_note')
    },
    {
      id: 'conv.focus-reply',
      label: t('command.focusReplyBox'),
      keywords: [t('globals.terms.reply'), 'editor', 'compose'],
      section,
      icon: PenLine,
      permission: [perms.MESSAGES_WRITE, perms.MESSAGES_WRITE_PRIVATE],
      run: () => emitter.emit(EMITTER_EVENTS.REPLY_BOX_FOCUS)
    }
  ]

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    emitter.emit(EMITTER_EVENTS.SHOW_TOAST, { description: t('globals.messages.copied') })
  }

  const miscCommands = (conv) => [
    {
      id: 'conv.mark-unread',
      label: t('globals.messages.markAsUnread'),
      keywords: ['unread'],
      section,
      icon: MailOpen,
      run: () => conversationStore.markAsUnread(conv.uuid)
    },
    {
      id: 'conv.copy-link',
      label: t('globals.messages.copyLink'),
      keywords: [t('globals.terms.copy'), t('globals.terms.link'), 'url'],
      section,
      icon: Link2,
      run: copyLink
    },
    {
      id: 'conv.transcript',
      label: t('conversation.downloadTranscript'),
      keywords: ['export'],
      section,
      icon: Download,
      run: () =>
        emitter.emit(EMITTER_EVENTS.CONVERSATION_ACTION, CONVERSATION_ACTIONS.DOWNLOAD_TRANSCRIPT)
    },

    ...(conv.contact_id ? [] : [])
  ]

  return computed(() => {
    if (!conversationStore.isConversationOpen) return []
    const conv = conversationStore.current
    if (!conv) return []
    return [...statusCommands(conv), ...miscCommands(conv), ...composeCommands()]
  })
}
