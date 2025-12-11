/* -------------------------------------------------------------------------- */
/*                             Flows / Create sync                            */
/* -------------------------------------------------------------------------- */
/**
 * This section is a monster.
 *
 * 1. Notify user of requirements and ask if they want to continue
 * 2. Initialize Airtable and Webflow settings via separate sub functions
 * 3. Ask user to match fields
 * 4. Ask user for additional settings
 * 5. Create sync object
 * 6. Save updated config
 *
 */

// TODO: copy over the prompt cancellation function from webflow-cli-toolbelt

import { createAirtableConfig } from './airtable-config'
import { createWebflowConfig } from './webflow-config'
import { matchFields } from './match-fields/index'
import { getSettings } from './get-settings'
import { buildSync } from './build-sync'
import { ui } from '../../../ui'
import { state } from '../../../state'
import { configTools } from '../../../config-tools'
import { viewSync } from '../view-syncs/view-sync'
import { history } from '../../../history'

export async function createSync() {
    history.add(createSync)

    try {
        ui.prompt.log.info(ui.format.bold('🔨 Create sync'))
        ui.prompt.note(`You will need a few things to get started:

        - Airtable access token
        - Webflow access token

        - Airtable fields (tinySync can create these for you)
            - Name
            - Slug
            - State
            - Webflow item ID
            - Last published

    Read more about these required fields on Github.`)

        /* ------------------------------ Confirmation ------------------------------ */
        const shallWeContinue = await ui.prompt.confirm({ message: 'Got it?' })
        await ui.handleCancel(shallWeContinue)

        if (shallWeContinue === false) {
            await history.back()
            return
        }

        /* --------------------------- Configure endpoints -------------------------- */
        const airtableConfig = await createAirtableConfig() // TODO:
        const webflowConfig = await createWebflowConfig(airtableConfig) // TODO:

        /* ------------------------------ Match fields ------------------------------ */
        ui.prompt.log.info(ui.format.bold('Field matching'))
        ui.prompt.log.message("Hopefully it's not too confusing...")
        const fields = await matchFields(airtableConfig, webflowConfig) // TODO:

        /* ------------------------------ Get settings ------------------------------ */
        ui.prompt.log.info(ui.format.bold('Settings'))
        const settings = await getSettings(webflowConfig) // TODO:

        /* ---------------------------- Build sync object --------------------------- */
        const sync = await buildSync(
            airtableConfig,
            webflowConfig,
            fields,
            settings
        )

        /* ------------------------ Save config and open sync ----------------------- */
        state.config.syncs.push(sync)
        await configTools.save()
        ui.prompt.log.success('✅ Sync added successfully!')
        ui.prompt.log.message('')

        await viewSync(true)
    } catch (error) {
        ui.prompt.log.error('There was an error creating the sync.')
        await history.back()
        return
    }
}
