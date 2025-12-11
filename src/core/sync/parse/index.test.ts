import { parseAirtableRecord } from '.'
import { testRecord } from '../../dev/airtable-record'
import { testConfig } from '../../dev/config'

async function go() {
    try {
        console.log(
            '🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥'
        )
        // delete testRecord.fields.fldH8nFKe2i2X6o5S;
        const parsedRecord = await parseAirtableRecord(testRecord, testConfig)
        console.log(
            '🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨'
        )
        console.log(parsedRecord)
    } catch (error) {
        console.error(error)
    }
}
go()
