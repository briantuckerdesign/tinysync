import { expect, test } from 'bun:test'
import { mockData } from '../../../dev/mock-data'
import { getRecords } from './get-records'
import type { AirtableRecord } from './types'

test('Airtable - getRecord', async () => {
    const records = await getRecords(
        mockData.tokens.airtable,
        mockData.baseId,
        mockData.tableId,
        mockData.viewId
    )

    expect(records).toBeArray()

    const record = records[0] as AirtableRecord
    expect(record).toHaveProperty('id')
    expect(record).toHaveProperty('createdTime')
    expect(record).toHaveProperty('fields')
    expect(record.fields).toBeObject()
})
