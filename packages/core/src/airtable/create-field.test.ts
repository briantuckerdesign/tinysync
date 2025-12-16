import { expect, test } from 'bun:test'
import { mockData } from '../../../../dev/mock-data'
import { createField } from './create-field'
import type { AirtableField, AirtableFieldType } from './types'

const type: AirtableFieldType = 'singleLineText'
const name = `delete-me-${Math.random().toString(36).substring(2, 6)}`
const fieldToCreate: AirtableField = {
    type,
    name,
}

test('Airtable - createField', async () => {
    const field = await createField(
        mockData.tokens.airtable,
        mockData.baseId,
        mockData.tableId,
        fieldToCreate
    )
    expect(field).toHaveProperty('id')
    expect(field).toHaveProperty('name')
    expect(field.name).toBe(name)
    expect(field).toHaveProperty('type')
    expect(field.type).toBe(type)
})
