import { ui } from '../../../ui'

export async function getSettings(
    webflowConfig: WebflowConfig
): Promise<SyncSettings> {
    try {
        const settings = (await ui.prompt.group(
            {
                syncName: () =>
                    ui.prompt.text({
                        message: 'What would you like to name this sync?',
                    }),
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
                onCancel: async ({ results }) => {
                    return
                },
            }
        )) as SyncSettings

        if (webflowConfig.site.customDomains) {
            const publishToSubdomain = await ui.prompt.confirm({
                message: 'Publish to webflow.io subdomain?',
            })

            await ui.handleCancel(publishToSubdomain)

            settings.publishToSubdomain = publishToSubdomain as boolean
        } else {
            // TODO: Check if when customDomain length is 0, that there's no special flag needed to publish to subdomain
            settings.publishToSubdomain = true
        }
        return settings
    } catch (error) {
        ui.prompt.log.error('Error getting settings.')
    }
}
