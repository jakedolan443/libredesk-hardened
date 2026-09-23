# Mail-focused LibreDesk fork

A self-hosted shared email application derived from LibreDesk. This fork keeps email receiving and sending, threading, attachments, rich replies, drafts, search, statuses, snoozing, views, private notes, and mentions.

The contacts/CRM, assignment, priorities, automation, macros, SLAs, business hours, surveys, reporting, public help center, website chat, AI assistants, and copilot, tags, and notifications have been removed. The app opens directly into the mailbox; mailbox settings are available from the settings icon beside the user name.

Email runs over IMAP and SMTP, including Google/Microsoft OAuth. This is a conversation-based shared mailbox, not a full bidirectional IMAP folder client.

See [the mail-only upgrade notes](docs/mail-only.md) before upgrading an existing database.

## Installation

### Docker

The latest image is available in GitHub Container Registry at [`ghcr.io/jakedolan443/libredesk-hardened:latest`](https://github.com/jakedolan443/libredesk-hardened/pkgs/container/libredesk-hardened).

```shell
# Download the compose file and sample config file in the current directory.
curl -LO https://github.com/jakedolan443/libredesk-hardened/raw/main/docker-compose.yml
curl -LO https://github.com/jakedolan443/libredesk-hardened/raw/main/config.sample.toml

# Copy the config.sample.toml to config.toml and edit it as needed.
cp config.sample.toml config.toml

# Run the services in the background.
docker compose up -d

# Setting System user password.
docker exec -it libredesk_app ./libredesk --set-system-user-password
```

Go to `http://localhost:9000` and login with username `System` and the password you set using the `--set-system-user-password` command.

See [installation docs](https://docs.libredesk.io/getting-started/installation)

__________________

### Binary
- Download the [latest release](https://github.com/jakedolan443/libredesk-hardened/releases) and extract the libredesk binary.
- Edit config.toml as needed.
- `./libredesk --install` to setup the Postgres DB.
- Run `./libredesk --set-system-user-password` to set the password for the System user.
- Run `./libredesk` and visit `http://localhost:9000` and login with email `System` and the password you set using the --set-system-user-password command.

See [installation docs](https://docs.libredesk.io/getting-started/installation)
__________________

## Developers

For local development and setup, refer to the [developer setup](https://docs.libredesk.io/contributing/developer-setup).

The backend is written in Go and the frontend is Vue.js 3 with Shadcn UI.
