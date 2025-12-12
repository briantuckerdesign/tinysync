import { runSync } from './sync/run-sync'
import { webflow } from './webflow'

export const tinySync = {
    sync: runSync,
    publishSite: webflow.publish.site,
}
