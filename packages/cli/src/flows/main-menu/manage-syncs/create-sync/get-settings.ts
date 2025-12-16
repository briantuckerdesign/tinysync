import { manageSyncs } from '..'
import type { SyncSettings } from '@tinysync/core'
import type { WebflowConfig } from '../../../../types'
import { ui } from '../../../../ui'

export async function getSettings(
    syncName: string,
    webflowConfig: WebflowConfig
): Promise<SyncSettings> {
    ui.prompt.log.info(ui.format.bold('Settings'))
    try {
        let publishToSubdomainEnabled = false

        if (webflowConfig.site.customDomains) {
            const publishToSubdomain = await ui.prompt.confirm({
                message: 'Publish to webflow.io subdomain?',
            })
            await ui.handleCancel(publishToSubdomain)

            publishToSubdomainEnabled = publishToSubdomain as boolean
        } else {
            publishToSubdomainEnabled = true
        }

        const userConfirms = await ui.prompt.group(
            {
                autoPublish: () =>
                    ui.prompt.confirm({
                        message:
                            'Automatically publish site if validation error occurs?',
                    }),
                deleteRecords: () =>
                    ui.prompt.confirm({
                        message:
                            'Delete records from Webflow if they are deleted in Airtable?',
                    }),
            },
            {
                onCancel: async () => {
                    return await manageSyncs()
                },
            }
        )

        const settings: SyncSettings = {
            syncName,
            autoPublish: userConfirms.autoPublish,
            deleteRecords: userConfirms.deleteRecords,
            publishToSubdomain: publishToSubdomainEnabled,
        }

        return settings
    } catch (error) {
        ui.prompt.log.error('Error getting settings.')
        throw error
    }
}
