import { expect, test } from 'bun:test'
import { mockData } from '../../dev/mock-data'
import { updateRecord } from './update-record'

test('Airtable - updateRecord', async () => {
    const fieldName = mockData.primaryFieldId
    const fieldValue = 'Do not delete this record 1a'

    const updatedRecord = await updateRecord(
        mockData.tokens.airtable,
        mockData.baseId,
        mockData.tableId,
        mockData.recordId,
        {
            [fieldName]: fieldValue,
        }
    )

    expect(updatedRecord).toHaveProperty('id')
    expect(updatedRecord).toHaveProperty('createdTime')
})
