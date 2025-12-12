import { expect, test } from 'bun:test'
import { mockData } from '../../dev/mock-data'
import { getRecord } from './get-record'

test('Airtable - getRecord', async () => {
    const record = await getRecord(
        mockData.tokens.airtable,
        mockData.baseId,
        mockData.tableId,
        mockData.recordId
    )

    expect(record).toHaveProperty('id')
    expect(record).toHaveProperty('createdTime')
    expect(record).toHaveProperty('fields')
    expect(record.fields).toBeObject()
})
