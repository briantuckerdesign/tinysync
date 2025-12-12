import { expect, test } from 'bun:test'
import { mockData } from '../../dev/mock-data'
import { getBases } from './get-bases'
import type { AirtableBasesListItem } from './types'

test('Airtable - getBases', async () => {
    const bases = await getBases(mockData.tokens.airtable)
    expect(bases).toBeArray()
    const base = bases[0] as AirtableBasesListItem
    expect(base).toBeDefined()
    expect(base).toHaveProperty('id')
    expect(base).toHaveProperty('name')
    expect(base).toHaveProperty('permissionLevel')
    expect(base.permissionLevel).toBeOneOf([
        'none',
        'read',
        'comment',
        'edit',
        'create',
    ])
})
