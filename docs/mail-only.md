# Mail-only fork

The UI, HTTP routes and background workers for contacts/CRM, ticket assignment and priorities, automations, macros, SLA/business-hours tracking, CSAT, reports, activity logs, custom attributes, context links, public help centers, chat widgets and AI have been removed.

Retained: email inbox connections and OAuth, compose/reply with CC/BCC, attachments and image controls, drafts, threading, transcripts, search, read state, custom statuses and snoozing, personal/shared views, internal notes and mentions, account authentication, SSO, mailbox configuration, APIs and webhooks for the retained features.

## Existing installations

Back up the database before running the normal `--upgrade` command. Migration v3.0.0 removes retired feature tables and queued support notifications, clears assignment/priority/SLA state and macro draft metadata, disables non-email inboxes, and removes obsolete notification templates. Team-shared views become shared mailbox views. It preserves email conversations, messages, attachments, drafts, tags, views and message sender identities. Tags are subsequently removed by v3.2.0.

The legacy `users` sender records and some compatibility columns/types remain to preserve message foreign keys and historical migrations. They no longer provide a contact directory, editable contact profiles, contact notes, blocking, export or CRM enrichment. New sender records store only an email address and display name, and are reused without updating a profile. Conversation responses expose this minimal identity as `correspondent`. The new-message endpoint takes `email` instead of `contact_email` and no longer accepts assignment or custom-field inputs as features.

Historical chat rows remain in storage rather than deleting message history during an upgrade; chat inboxes cannot run and are excluded from mailbox access. Stored views that filter on removed assignment, priority, SLA or contact-profile fields need to be recreated using mailbox fields.

Account authentication and internal permission checks remain infrastructure. The custom-role/team management UI has been removed. Existing accounts with mailbox read access receive shared mailbox access during the upgrade because assignment-based mail visibility no longer has a user-facing workflow.

## Development

Build the frontend with `cd frontend && pnpm build:main`, then build the Go backend. There is no widget build. Run `go test ./...` and `cd frontend && pnpm test:run`. Set `LIBREDESK_TEST_DB_DSN` to a disposable PostgreSQL instance to run the database-backed tests as well. `make build-backend` builds the Go package; `make build` also builds and embeds the frontend.

Migration v3.1.0 removes the notification inbox, preferences, email alert queue, browser push subscriptions, alert templates and notification permissions. Account welcome/password-reset email transport is separate and uses the account_email configuration namespace; existing SMTP settings are migrated automatically. Mailbox unread counts, live updates, mentions, and action/error feedback remain available.

Migration v3.2.0 retires tags, their reply prompts, activity records, permissions and webhook subscriptions. It removes tag predicates from saved views (including nested groups), preserving the remaining predicates. A view containing only tag predicates becomes unfiltered.
