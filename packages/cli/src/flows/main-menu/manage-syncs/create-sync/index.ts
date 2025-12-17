import { manageSyncs } from '..'
import { state } from '../../../../state'
import { syncs } from '../../../../syncs'
import { ui } from '../../../../ui'
import { viewSyncDetails } from '../manage-sync/view-sync-details'
import { createAirtableConfig } from './airtable-config'
import { buildSync } from './build-sync'
import { getSyncName } from './get-name'
import { getSettings } from './get-settings'
import { matchFields } from './match-fields/index'
import { createWebflowConfig } from './webflow-config'

export async function createSync() {
    try {
        // Inform user
        ui.prompt.log.info(ui.format.bold('🔨 Create sync'))
        ui.prompt.note(`You will need a few things to get started:

        - Airtable access token
        - Webflow access token

        - Airtable fields (tinysync can create these for you)
            - Name
            - Slug
            - State
            - Webflow item ID
            - Last published date

    Read the docs to learn more.`)

        // Confirm creation
        const shallWeContinue = await ui.prompt.confirm({ message: 'Got it?' })
        await ui.handleCancel(shallWeContinue)
        if (shallWeContinue === false) return await manageSyncs()

        // Get sync name
        const syncName = await getSyncName()

        // Get initial config from both platforms
        const airtableConfig = await createAirtableConfig(syncName)
        const webflowConfig = await createWebflowConfig()

        // User matches Airtable/Webflow fields
        const fields = await matchFields(airtableConfig, webflowConfig)

        // Get general sync settings
        const settings = await getSettings(syncName, webflowConfig)

        // Compile into sync
        const sync = await buildSync(
            airtableConfig,
            webflowConfig,
            fields,
            settings
        )

        // Save to file
        state.syncs.push(sync)
        const saved = await syncs.save()
        if (!saved) throw new Error('There was an issue saving the sync.')

        ui.prompt.log.success('✅ Sync added successfully!')

        return await viewSyncDetails(sync)
    } catch (error) {
        ui.prompt.log.error('There was an error creating the sync.')
        return await manageSyncs()
    }
}
