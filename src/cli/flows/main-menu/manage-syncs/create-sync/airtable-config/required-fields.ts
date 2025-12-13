import { manageSyncs } from '../..'
import { airtable } from '../../../../../../core/airtable'
import type {
    AirtableBasesListItem,
    AirtableField,
    AirtableTable,
} from '../../../../../../core/airtable/types'
import { ui } from '../../../../../ui'

export async function handleRequiredFields(
    token: string,
    base: AirtableBasesListItem,
    table: AirtableTable
) {
    const fields = table.fields.map((field) => ({
        label: field.name,
        value: field,
    })) as any[]

    // Adds [ Create for me ] to options
    fields.unshift({
        label: `${ui.format.italic('[ Create for me ]')}`,
        value: 'createForMe',
    })

    const stateField = await handleFieldCreation(
        token,
        base,
        table,
        fields.filter(
            (field) =>
                field.value === 'createForMe' ||
                field.value.type === 'singleLineText' ||
                field.value.type === 'singleSelect' ||
                field.value.type === 'formula'
        ),
        'State',
        'Airtable field to store item state.',
        {
            name: 'State [TinySync]',
            type: 'singleSelect',
            description:
                'Tells TinySync how to proceed. Read the docs for more info.',
            options: {
                choices: [
                    {
                        name: 'Not synced',
                        color: 'grayLight2',
                    },
                    {
                        name: 'Queued for sync',
                        color: 'redBright',
                    },
                    {
                        name: 'Always sync',
                        color: 'purpleBright',
                    },
                    {
                        name: 'Staging',
                        color: 'greenLight2',
                    },
                ],
            },
        }
    )

    if (ui.prompt.isCancel(stateField)) {
        await manageSyncs()
        process.exit(0)
    }

    const slugField = await handleFieldCreation(
        token,
        base,
        table,
        fields.filter(
            (field) =>
                field.value === 'createForMe' ||
                field.value.type === 'singleLineText'
        ),
        'Slug',
        'Airtable field to store Webflow item slug.',
        {
            name: 'Slug [TinySync]',
            type: 'singleLineText',
            description: 'Stores the Webflow item slug.',
        }
    )

    if (ui.prompt.isCancel(slugField)) {
        await manageSyncs()
        process.exit(0)
    }

    const webflowItemIdField = await handleFieldCreation(
        token,
        base,
        table,
        fields.filter(
            (field) =>
                field.value === 'createForMe' ||
                field.value.type === 'singleLineText'
        ),
        'Webflow Item ID',
        'Airtable field to store Webflow item ID.',
        {
            name: 'Webflow Item ID [TinySync]',
            type: 'singleLineText',
            description: 'Stores the Webflow item ID.',
        }
    )

    if (ui.prompt.isCancel(webflowItemIdField)) {
        await manageSyncs()
        process.exit(0)
    }

    const lastPublishedField = await handleFieldCreation(
        token,
        base,
        table,
        fields.filter(
            (field) =>
                field.value === 'createForMe' || field.value.type === 'dateTime'
        ),
        'Last Published',
        'Airtable field to store last published date/time.',
        {
            name: 'Last Published [TinySync]',
            type: 'dateTime',
            description: 'Stores the last published date/time.',
            options: {
                timeZone: 'client',
                dateFormat: {
                    name: 'local',
                },
                timeFormat: {
                    name: '12hour',
                },
            },
        }
    )

    if (ui.prompt.isCancel(lastPublishedField)) {
        await manageSyncs()
        process.exit(0)
    }

    return {
        stateField,
        slugField,
        webflowItemIdField,
        lastPublishedField,
    }
}

async function handleFieldCreation(
    token: string,
    base: AirtableBasesListItem,
    table: AirtableTable,
    compatibleFields: any[],
    fieldName: string,
    description: string,
    fieldOptions: any
) {
    // compatibleFields is already in { label, value } format
    const selectedValue = (await ui.prompt.select({
        message: `${fieldName}: ${description}`,
        options: compatibleFields,
    })) as any

    if (ui.prompt.isCancel(selectedValue)) {
        await manageSyncs()
        process.exit(0)
    }

    // If user selects "Create for me" create the field
    if (selectedValue === 'createForMe') {
        ui.spinner.start(`Creating ${fieldName} field...`)
        const response = await airtable.create.field(
            token,
            base.id,
            table.id,
            fieldOptions
        )
        ui.spinner.stop(`✅ ${ui.format.dim(`${fieldName} field created.`)}`)

        return response as AirtableField
    }

    return selectedValue as AirtableField
}
