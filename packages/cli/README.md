# @tinysync/cli

Interactive command-line interface for syncing data between Airtable and Webflow.

> **Note:** This package requires [Bun](https://bun.sh) runtime.

## Installation

```bash
bun add -g @tinysync/cli
```

## Usage

```bash
tinysync
```

The CLI will guide you through:

1. **Creating a password** - Encrypts your API tokens locally
2. **Adding tokens** - Store your Airtable and Webflow API tokens
3. **Creating syncs** - Map Airtable bases/tables to Webflow collections
4. **Running syncs** - Execute syncs with real-time progress

## Features

- **One-directional sync** - Push Airtable records to Webflow collections
- **Granular control** - Choose exactly which records to sync via State field
- **All field types** - Support for all Airtable field types including linked records
- **Orphan cleanup** - Optionally delete Webflow items with no corresponding Airtable records
- **No record limits**\* - Sync as many records as you need
    - <sub>\*Subject to Airtable/Webflow API rate limits 🧘</sub>

## Airtable Requirements

- Access token with read/write permissions for records/schema for your table.

Special fields are required (the CLI can auto-create these):

| Field             | Type             | Purpose                                                                            |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `State`           | Single select    | Controls sync behavior (`Not synced`, `Queued for sync`, `Always sync`, `Staging`) |
| `Slug`            | Single line text | URL slug for Webflow item                                                          |
| `Webflow Item ID` | Single line text | Links record to Webflow item                                                       |
| `Last Published`  | Date/time        | Tracks last sync timestamp                                                         |
| `Errors`          | multilineText    | Tracks errors while syncing                                                        |

## Webflow Requirements

- Access token with **CMS** and **Sites** read/write permissions

## Development

```bash
# From monorepo root
bun install
bun start

# Or from this directory
bun src/index.ts
```

### Local certificate issues

If you work at a company that uses a system-level VPN, you may run into a certificate error when attempting sync functions.
This can be mitigated using the `NODE_TLS_REJECT_UNAUTHORIZED=0` environment variable, or running the premade script before running tinysync:

`bun run start:local`

## License

ISC
