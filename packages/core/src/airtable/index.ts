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
