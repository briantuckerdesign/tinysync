# @tinysync/cli

Command-line interface for tinysync - sync data between Airtable and Webflow.

**Note:** This package ships raw TypeScript source and requires Bun to run.

## Installation

```bash
bun add -g @tinysync/cli
```

## Requirements

- [Bun](https://bun.sh) runtime (native TypeScript support)

## Quick Start

After installation, run:

```bash
tinysync
```

The CLI will guide you through:

1. **Creating a password** - Securely encrypt your API tokens
2. **Adding tokens** - Add your Airtable and Webflow API tokens
3. **Creating syncs** - Configure synchronization between your Airtable bases and Webflow collections
4. **Running syncs** - Execute syncs manually whenever you need them

## Features

- 🔐 **Secure token storage** - All API tokens are encrypted locally
- 🎯 **Granular sync control** - Choose exactly which records to sync
- 📊 **Progress tracking** - Real-time feedback during sync operations
- 🔄 **Bidirectional field mapping** - Map Airtable fields to Webflow fields
- 🚀 **Auto-publish** - Optionally publish your Webflow site after syncing
- 🗑️ **Orphan cleanup** - Optionally delete Webflow items with no corresponding Airtable records

## Requirements

### Airtable

- Airtable account
- Base with a table that matches a Webflow collection
- API token with read/write permissions
- Four required fields (can be auto-created):
    - `State` (single select): `Not synced`, `Queued for sync`, `Always sync`, `Staging`
    - `Last Published` (date/time)
    - `Webflow Item ID` (single line text)
    - `Slug` (single line text)

### Webflow

- Webflow account
- Site with a collection matching an Airtable table
- Access token with CMS and Sites read/write permissions

## Development

```bash
# Clone the repository
git clone https://github.com/briantuckerdesign/tinysync.git
cd tinysync

# Install dependencies
bun install

# Run in development mode
bun --filter @tinysync/cli start
```

## Running

```bash
# Run directly with Bun (no build needed)
bun --filter @tinysync/cli start

# Or from the CLI directory
cd packages/cli
bun src/index.ts
```

## License

ISC

## Repository

https://github.com/briantuckerdesign/tinysync/tree/main/packages/cli
