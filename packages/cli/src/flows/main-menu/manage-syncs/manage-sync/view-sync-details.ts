import { AsciiTable3 } from 'ascii-table3'
import { manageSync } from '.'
import { ui } from '../../../../ui'
import type { Sync } from '@tinysync/core'

export async function viewSyncDetails(sync: Sync) {
    try {
        // Display sync header info
        ui.prompt.log.info(`\nSync Details: ${sync.name}`)

        // Display basic settings
        const settingsTable = new AsciiTable3('Settings')
            .setHeading('Setting', 'Value')
            .addRow(
                'Delete records at destination if deleted at source',
                sync.config.deleteOrphanedItems ? '✓' : '✗'
            )
            .addRow(
                'Publish to webflow.io subdomain',
                sync.config.publishToStagingSubdomain ? '✓' : '✗'
            )

        ui.prompt.log.info(settingsTable.toString())

        // Display custom domains if any
        if (sync.config.webflow.site.customDomains?.length) {
            const domainsTable = new AsciiTable3('Custom Domains').setHeading(
                'Domain'
            )
            sync.config.webflow.site.customDomains.forEach((domain) => {
                domainsTable.addRow(domain.url)
            })
            ui.prompt.log.info(domainsTable.toString())
        }

        // Display connection details
        const connectionsTable = new AsciiTable3('Connections')
            .setHeading('Platform', 'Details')
            .addRow('Airtable Base', sync.config.airtable.base.name)
            .addRow('Airtable Table', sync.config.airtable.table.name)
            .addRow('Webflow Site', sync.config.webflow.site.name)
            .addRow('Webflow Collection', sync.config.webflow.collection.name)

        ui.prompt.log.info(connectionsTable.toString())

        let fieldsTable = new AsciiTable3('Field Mappings').setHeading(
            'Webflow Field',
            'Type',
            'Airtable Field',
            'Type'
        )

        sync.fields.forEach((field) => {
            fieldsTable.addRow(
                field.webflow?.name || 'N/A',
                field.webflow?.type || 'N/A',
                field.airtable.name,
                field.airtable.type
            )
        })

        ui.prompt.log.info(fieldsTable.toString())
    } catch (error) {
        ui.prompt.log.error('Error viewing sync details.')
    } finally {
        return await manageSync(sync)
    }
}
