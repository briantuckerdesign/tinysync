import { expect, test } from 'bun:test'
import { mockData } from '../../../../dev/mock-data'
import { getSchema } from './get-schema'

test('Airtable - getSchema', async () => {
    const schema = await getSchema(
        mockData.tokens.airtable,
        mockData.baseId,
        mockData.tableId,
        mockData.viewId
    )

    expect(schema).toHaveProperty('id')
    expect(schema).toHaveProperty('name')
    expect(schema).toHaveProperty('primaryFieldId')
    expect(schema).toHaveProperty('fields')
    expect(schema.fields).toBeArray()
})
