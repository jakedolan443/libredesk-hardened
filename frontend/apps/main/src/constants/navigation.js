export const adminNavItems = [
  {
    titleKey: 'globals.terms.workspace',
    children: [
      {
        titleKey: 'globals.terms.general',
        href: '/admin/general',
        permission: 'general_settings:manage',
        icon: 'Settings'
      },
      {
        titleKey: 'admin.systemResources.title',
        href: '/admin/resources',
        permission: 'general_settings:manage',
        icon: 'Gauge'
      }
    ]
  },

  {
    titleKey: 'globals.terms.channel',
    isTitleKeyPlural: true,
    children: [
      {
        titleKey: 'globals.terms.inbox',
        href: '/admin/inboxes',
        createRouteName: 'new-inbox',
        permission: 'inboxes:manage',
        isTitleKeyPlural: true,
        icon: 'Inbox'
      }
    ]
  },
  {
    titleKey: 'globals.terms.conversation',
    isTitleKeyPlural: true,
    children: [
      {
        titleKey: 'globals.terms.status',
        href: '/admin/conversations/statuses',
        permission: 'status:manage',
        isTitleKeyPlural: true,
        icon: 'CircleDot'
      },

      {
        titleKey: 'globals.terms.sharedView',
        href: '/admin/conversations/shared-views',
        createRouteName: 'new-shared-view',
        permission: 'shared_views:manage',
        isTitleKeyPlural: true,
        icon: 'Eye'
      },
      {
        titleKey: 'globals.terms.template',
        href: '/admin/templates',
        createRouteName: 'new-template',
        permission: 'templates:manage',
        isTitleKeyPlural: true,
        icon: 'FileText'
      }
    ]
  },

  {
    titleKey: 'globals.terms.security',
    children: [
      {
        titleKey: 'globals.terms.sso',
        href: '/admin/sso',
        createRouteName: 'new-sso',
        permission: 'oidc:manage',
        icon: 'KeyRound'
      }
    ]
  },
  {
    titleKey: 'globals.terms.integration',
    isTitleKeyPlural: true,
    children: [
      {
        titleKey: 'globals.terms.webhook',
        href: '/admin/webhooks',
        createRouteName: 'new-webhook',
        permission: 'webhooks:manage',
        isTitleKeyPlural: true,
        icon: 'Webhook'
      }
    ]
  }
]
