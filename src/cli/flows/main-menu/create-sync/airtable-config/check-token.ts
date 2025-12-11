import { airtable } from '../../../../core/airtable'
import { history } from '../../../../history'
import { ui } from '../../../../ui'

export async function checkAirtableToken(
    token: any
): Promise<Array<AirtableBasesListItem> | undefined> {
    history.add(checkAirtableToken, [], false)

    try {
        // Check if API token is valid by trying to get bases
        ui.spinner.start('Checking API token...')
        let bases = await airtable.getBases(token)

        // If API token is invalid, ask user to try again
        if (!bases) {
            ui.prompt.log.error('Something went wrong.')
            ui.prompt.log.message(
                "Either your token is invalid, or it doesn't have 'create' permissions on any bases."
            )
            ui.prompt.log.message('Please try again.')
            ui.spinner.stop()
            return undefined
        } else {
            ui.spinner.stop(`✅ ${ui.format.dim('Airtable token validated.')}`)
            return bases
        }
    } catch (error) {
        ui.prompt.log.error('Error checking Airtable token.')
        history.back()
        return
    }
}
