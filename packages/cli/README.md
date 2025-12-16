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

- **Encrypted token storage** - API tokens never stored in plain text
- **Granular sync control** - Sync specific records via Airtable State field

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

## License

ISC
