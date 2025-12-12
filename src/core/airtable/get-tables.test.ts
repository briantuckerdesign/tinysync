import { expect, test } from 'bun:test'
import { mockData } from '../../../dev/mock-data'
import { getTables } from './get-tables'
import type { AirtableTable } from './types'

test('Airtable - getTables', async () => {
    const tables = await getTables(mockData.tokens.airtable, mockData.baseId)

    expect(tables).toBeArray

    const table = tables[0] as AirtableTable
    expect(table).toHaveProperty('id')
    expect(table).toHaveProperty('name')
    expect(table).toHaveProperty('primaryFieldId')
    expect(table).toHaveProperty('fields')
    expect(table).toHaveProperty('views')
})
