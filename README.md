# tinysync

**Airtable → Webflow sync via Bun**

A monorepo containing tools for one-way synchronization from Airtable to Webflow CMS.

## Features

- **One-directional sync** - Push Airtable records to Webflow collections
- **Granular control** - Choose exactly which records to sync via State field
- **All field types** - Support for all Airtable field types including linked records
- **Orphan cleanup** - Optionally delete Webflow items with no corresponding Airtable records
- **No record limits**\* - Sync as many records as you need
    - <sub>\*Subject to Airtable/Webflow API rate limits 🧘</sub>

## Packages

| Package                           | Description                                                  |
| --------------------------------- | ------------------------------------------------------------ |
| [@tinysync/cli](./packages/cli)   | Interactive command-line interface for managing syncs        |
| [@tinysync/core](./packages/core) | Core sync engine and API wrappers (use in your own projects) |

## Quick Start

### Using the CLI

```bash
# Install globally
bun add -g @tinysync/cli

# Run
tinysync
```

The CLI will guide you through setting up your API tokens and configuring syncs.

### Using the Core Library

```bash
bun add @tinysync/core
```

```typescript
import { runSync, createSyncEmitter } from '@tinysync/core'

const emitter = createSyncEmitter()
emitter.on('complete', ({ summary }) => console.log('Done!', summary))

await runSync({
    sync: yourSyncConfig,
    airtableToken: 'your-token',
    webflowToken: 'your-token',
    emitter,
})
```

## Requirements

- [Bun](https://bun.sh) runtime

### Airtable Setup

Your Airtable base needs special fields (can be auto-created by the CLI):

| Field             | Type             | Purpose                            |
| ----------------- | ---------------- | ---------------------------------- |
| `State`           | Single select    | Controls sync behavior             |
| `Slug`            | Single line text | URL slug for Webflow               |
| `Webflow Item ID` | Single line text | Links records to Webflow items     |
| `Last Published`  | Date/time        | Tracks when record was last synced |
| `Errors`          | multilineText    | Tracks errors while syncing        |

### State Options

| State             | Behavior                                               |
| ----------------- | ------------------------------------------------------ |
| blank             | If delete orphans enabled, removes from Webflow        |
| `Not synced`      | Won't sync, deletes from Webflow if previously synced. |
| `Queued for sync` | Syncs on next run, then changes to `Staging`           |
| `Always sync`     | Syncs on every run                                     |
| `Staging`         | Already synced, but won't update on next run           |

### Webflow Setup

- Access token with **CMS** and **Sites** read/write permissions

## Development

```bash
# Clone
git clone https://github.com/briantuckerdesign/tinysync.git
cd tinysync

# Install dependencies
bun install

# Run CLI in dev mode
bun start

# Type check
bun run typecheck

# Run tests
bun test
```

### Local certificate issues

If you work at a company that uses a system-level VPN, you may run into a certificate error when attempting sync functions.
This can be mitigated using the `NODE_TLS_REJECT_UNAUTHORIZED=0` environment variable, or running the premade script before running tinysync:

`bun run localdev`

## License

ISC
