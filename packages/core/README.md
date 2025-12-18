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
    if (!data) return

    switch (data.type) {
        case 'spinner':
            // Indeterminate progress (fetching data, parsing)
            console.log(`⏳ ${message}`)
            break
        case 'progress-start':
            // Starting a phase with known total
            console.log(`▶ ${message} (${data.total} items)`)
            break
        case 'progress-advance':
            // Progress update
            console.log(`  ${message}`)
            break
        case 'progress-end':
            // Phase complete
            console.log(`✓ ${message}`)
            break
    }
})

emitter.on('error', ({ error, fatal }) => {
    console.error('Sync error:', error, fatal ? '(fatal)' : '')
})

emitter.on('complete', ({ timeElapsed, summary }) => {
    console.log(`Sync complete in ${timeElapsed}s!`, summary)
})

// Run the sync
await runSync(
    yourSyncConfig,
    'your-airtable-token',
    'your-webflow-token',
    emitter
)
```

## Progress Events

The emitter provides granular progress tracking through different event types:

| Event Type         | Description                                | Data                    |
| ------------------ | ------------------------------------------ | ----------------------- |
| `spinner`          | Indeterminate progress (fetching, parsing) | `{ phase }`             |
| `progress-start`   | Start of a measurable phase                | `{ phase, total }`      |
| `progress-advance` | Progress within a phase                    | `{ phase, increment? }` |
| `progress-end`     | Phase completed                            | `{ phase }`             |

### Progress Phases

- `fetching-data` - Fetching records from Airtable and items from Webflow
- `parsing-data` - Parsing and categorizing records into actions
- `creating-items` - Creating new items in Webflow
- `updating-items` - Updating existing items in Webflow
- `deleting-items` - Deleting items from Webflow
- `updating-records` - Updating Airtable records with sync results

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
    // Sync types
    Sync,
    Token,
    Platform,
    SyncField,
    SyncSettings,

    // Emitter types
    SyncEmitter,
    SyncEmit,
    SyncProgressPhase,
    SyncProgressEvent,
    SyncProgressEventData,
    SpinnerEventData,
    ProgressStartEventData,
    ProgressAdvanceEventData,
    ProgressEndEventData,
    SyncErrorEvent,
    SyncCompleteEvent,

    // Airtable types
    AirtableRecord,
    AirtableField,
    AirtableBase,
    AirtableTable,
    // ... and more
} from '@tinysync/core'
```

## License

ISC
