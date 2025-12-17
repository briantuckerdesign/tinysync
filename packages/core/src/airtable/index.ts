/**
 * Airtable API wrapper module.
 *
 * Provides typed functions for interacting with the Airtable REST API:
 * - `airtable.get.bases()` - List accessible bases
 * - `airtable.get.tables()` - Get tables in a base
 * - `airtable.get.records()` - Fetch records with pagination
 * - `airtable.get.schema()` - Get base schema
 * - `airtable.get.record()` - Get single record
 * - `airtable.update.record()` - Update a record
 * - `airtable.create.field()` - Create a field in a table
 *
 * @module
 */
import { getBases } from './get-bases'
import { getTables } from './get-tables'
import { getRecords } from './get-records'
import { updateRecord } from './update-record'
import { createField } from './create-field'
import { getRecord } from './get-record'
import { getSchema } from './get-schema'

export const airtable = {
    get: {
        bases: getBases,
        tables: getTables,
        records: getRecords,
        schema: getSchema,
        record: getRecord,
    },
    update: {
        record: updateRecord,
    },
    create: {
        field: createField,
    },
}
