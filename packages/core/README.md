# @tinysync/core

Core sync engine for tinysync - synchronize Airtable data to Webflow CMS.

> **Note:** This package requires [Bun](https://bun.sh) runtime.

## Installation

```bash
bun add @tinysync/core
```

## Quick Start

```typescript
import { runSync, createSyncEmitter, type Sync } from '@tinysync/core'

// Create an emitter to track sync progress
const emitter = createSyncEmitter()

emitter.on('progress', ({ message, data }) => {
    console.log(message, data)
})

emitter.on('error', ({ error, fatal }) => {
    console.error('Sync error:', error)
})

emitter.on('complete', ({ timeElapsed, summary }) => {
    console.log('Sync complete!', summary)
})

// Run the sync
await runSync(
    yourSyncConfig,
    'your-airtable-token',
    'your-webflow-token',
    emitter
)
```

## API

### Sync

```typescript
import { runSync, createSyncEmitter } from '@tinysync/core'

// Run a configured sync
await runSync(sync, airtableToken, webflowToken, emitter)

// Create typed event emitter for progress tracking
const emitter = createSyncEmitter()
```

### Airtable

```typescript
import { airtable } from '@tinysync/core'

// Fetch data
const bases = await airtable.get.bases(token)
const tables = await airtable.get.tables(token, baseId)
const records = await airtable.get.records(token, baseId, tableId)
const schema = await airtable.get.schema(token, baseId)

// Mutations
await airtable.update.record(token, baseId, tableId, recordId, fields)
await airtable.create.field(token, baseId, tableId, fieldConfig)
```

### Webflow

```typescript
import { webflow } from '@tinysync/core'

// Fetch data
const sites = await webflow.get.sites(token)
const collections = await webflow.get.collections(token, siteId)
const items = await webflow.get.items(token, collectionId)

// Mutations
await webflow.create.items(token, collectionId, itemsData)
await webflow.update.items(token, collectionId, itemsData)
await webflow.delete.items(token, collectionId, itemIds)
await webflow.publish.site(token, siteId, domains)
```

## Types

All TypeScript types are exported:

```typescript
import type {
    Sync,
    Token,
    Platform,
    SyncField,
    SyncEmitter,
    SyncSettings,
    AirtableRecord,
    AirtableField,
    AirtableBase,
    AirtableTable,
    // ... and more
} from '@tinysync/core'
```

## License

ISC
