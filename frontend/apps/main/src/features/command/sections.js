export const SECTIONS = {
  BULK: 'bulk',
  CONVERSATION: 'conversation',
  CONTACT: 'contact',
  LIST: 'list',
  ACTIONS: 'actions',
  CREATE: 'create',
  GOTO: 'goto',
  CONTACT_RESULTS: 'contact-results',
  CONVERSATION_RESULTS: 'conversation-results'
}

// Contextual sections come first, global ones last.
export const SECTION_ORDER = [
  SECTIONS.BULK,
  SECTIONS.CONVERSATION,
  SECTIONS.CONTACT,
  SECTIONS.LIST,
  SECTIONS.ACTIONS,
  SECTIONS.CREATE,
  SECTIONS.GOTO,
  SECTIONS.CONTACT_RESULTS,
  SECTIONS.CONVERSATION_RESULTS
]

export const SECTION_LABEL_KEYS = {
  [SECTIONS.BULK]: 'command.section.selectedConversations',
  [SECTIONS.CONVERSATION]: 'globals.terms.conversation',
  [SECTIONS.CONTACT]: 'globals.terms.correspondent',
  [SECTIONS.LIST]: 'command.section.list',
  [SECTIONS.ACTIONS]: 'globals.terms.action',
  [SECTIONS.CREATE]: 'globals.messages.create',
  [SECTIONS.GOTO]: 'command.section.goTo',
  [SECTIONS.CONTACT_RESULTS]: 'globals.terms.correspondent',
  [SECTIONS.CONVERSATION_RESULTS]: 'globals.terms.conversation'
}

export const SECTION_LABEL_PLURAL = new Set([
  SECTIONS.ACTIONS,
  SECTIONS.CONTACT_RESULTS,
  SECTIONS.CONVERSATION_RESULTS
])
