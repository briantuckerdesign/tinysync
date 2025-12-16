# @tinysync/core

Core sync functionality for tinysync - synchronize data between Airtable and Webflow.

**Note:** This package ships raw TypeScript source and requires Bun to run.

## Installation

```bash
bun add @tinysync/core
```

## Requirements

- [Bun](https://bun.sh) runtime (native TypeScript support)
- TypeScript 5.0+

## Usage

```typescript
import { runSync, createSyncEmitter, type Sync } from '@tinysync/core'

// Create an emitter to track sync progress
const emitter = createSyncEmitter()

// Listen to sync events
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
await runSync({
    sync: yourSyncConfig,
    airtableToken: 'your-airtable-token',
    webflowToken: 'your-webflow-token',
    emitter,
})
```

## API

### Main Functions

- `runSync(options)` - Execute a sync between Airtable and Webflow
- `createSyncEmitter()` - Create a typed event emitter for sync progress tracking

### Airtable API

```typescript
import { airtable } from '@tinysync/core'

// Get bases
const bases = await airtable.get.bases(token)

// Get tables from a base
const tables = await airtable.get.tables(token, baseId)

// Get records from a table
const records = await airtable.get.records(token, baseId, tableId)

// Get schema
const schema = await airtable.get.schema(token, baseId)

// Update a record
await airtable.update.record(token, baseId, tableId, recordId, fields)

// Create a field
await airtable.create.field(token, baseId, tableId, fieldConfig)
```

### Webflow API

```typescript
import { webflow } from '@tinysync/core'

// Get sites
const sites = await webflow.get.sites(token)

// Get collections
const collections = await webflow.get.collections(token, siteId)

// Get items
const items = await webflow.get.items(token, collectionId)

// Create items
await webflow.create.items(token, collectionId, itemsData)

// Update items
await webflow.update.items(token, collectionId, itemsData)

// Delete items
await webflow.delete.items(token, collectionId, itemIds)

// Publish site
await webflow.publish.site(token, siteId, domains)
```

## Types

All TypeScript types are exported for use in your projects:

```typescript
import type {
    Sync,
    Token,
    Platform,
    SyncField,
    SyncEmitter,
    AirtableRecord,
    AirtableField,
    // ... and many more
} from '@tinysync/core'
```

## License

ISC

## Repository

https://github.com/briantuckerdesign/tinysync/tree/main/packages/core
