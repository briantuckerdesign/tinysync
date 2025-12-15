import { manageSyncs } from '../..'
import { airtable } from '../../../../../../core/airtable'
import type {
    AirtableBasesListItem,
    AirtableField,
    AirtableTable,
} from '../../../../../../core/airtable/types'
import { ui } from '../../../../../ui'
import { sortFieldsByMatch } from '../match-fields/sort-fields-by-match'

export async function handleRequiredFields(
    token: string,
    base: AirtableBasesListItem,
    table: AirtableTable,
    syncName: string
) {
    const createForMe = {
        label: `${ui.format.italic('[ Create for me ]')}`,
        value: 'createForMe',
    }
    const fields = table.fields.map((field) => ({
        label: field.name,
        value: field,
    })) as any[]

    const fieldConfigs = [
        {
            key: 'stateField',
            name: 'State',
            description: 'Airtable field to store item state.',
            compatibleTypes: ['singleLineText', 'singleSelect', 'formula'],
            fieldOptions: {
                name: `State [${syncName}]`,
                type: 'singleSelect',
                description:
                    'Tells TinySync how to proceed. Read the docs for more info.',
                options: {
                    choices: [
                        { name: 'Not synced', color: 'grayLight2' },
                        { name: 'Queued for sync', color: 'redBright' },
                        { name: 'Always sync', color: 'purpleBright' },
                        { name: 'Staging', color: 'greenLight2' },
                    ],
                },
            },
        },
        {
            key: 'slugField',
            name: 'Slug',
            description: 'Airtable field to store Webflow item slug.',
            compatibleTypes: ['singleLineText'],
            fieldOptions: {
                name: `Slug [${syncName}]`,
                type: 'singleLineText',
                description: 'Stores the Webflow item slug.',
            },
        },
        {
            key: 'webflowItemIdField',
            name: 'Webflow Item ID',
            description: 'Airtable field to store Webflow item ID.',
            compatibleTypes: ['singleLineText'],
            fieldOptions: {
                name: `Webflow Item ID [${syncName}]`,
                type: 'singleLineText',
                description: 'Stores the Webflow item ID.',
            },
        },
        {
            key: 'lastPublishedField',
            name: 'Last Published',
            description: 'Airtable field to store last published date/time.',
            compatibleTypes: ['dateTime'],
            fieldOptions: {
                name: `Last Published [${syncName}]`,
                type: 'dateTime',
                description: 'Stores the last published date/time.',
                options: {
                    timeZone: 'client',
                    dateFormat: { name: 'local' },
                    timeFormat: { name: '12hour' },
                },
            },
        },
        {
            key: 'errorsField',
            name: 'Errors',
            description: 'Airtable field to store sync error information.',
            compatibleTypes: ['singleLineText'],
            fieldOptions: {
                name: `Errors [${syncName}]`,
                type: 'singleLineText',
                description: 'Stores the sync-related errors.',
            },
        },
    ]

    const results: Record<string, AirtableField> = {}

    for (const config of fieldConfigs) {
        const compatibleFields = fields.filter(
            (field) =>
                field.value === 'createForMe' ||
                config.compatibleTypes.includes(field.value.type)
        )
        sortFieldsByMatch(config.name, compatibleFields)
        compatibleFields.unshift(createForMe)

        const field = await handleFieldCreation(
            token,
            base,
            table,
            compatibleFields,
            config.name,
            config.description,
            config.fieldOptions
        )
        await ui.handleCancel(field, manageSyncs)
        results[config.key] = field
    }

    return {
        stateField: results.stateField as AirtableField,
        slugField: results.slugField as AirtableField,
        webflowItemIdField: results.webflowItemIdField as AirtableField,
        lastPublishedField: results.lastPublishedField as AirtableField,
        errorsField: results.errorsField as AirtableField,
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
