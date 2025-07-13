/* -------------------------------------------------------------------------- */
/*                             Sync / Delete sync                             */
/* -------------------------------------------------------------------------- */
import { configTools } from "../config-tools";

export async function deleteSync(state, syncConfig) {
  const confirmDelete = await ui.prompt.confirm({
    message: `Are you sure you want to delete ${syncConfig.name}?`,
  });

  if (ui.prompt.isCancel(confirmDelete) || confirmDelete === false) {
    await viewSync();
    return;
  }

  if (confirmDelete) {
    const syncs = state.config.syncs;
    // Returns all syncs except the one to delete
    state.config.syncs = syncs.filter((sync) => {
      return sync.name !== syncConfig.name;
    });

    await configTools.save(state);

    ui.prompt.log.message(`✅ ${ui.format.bold(syncConfig.name)} deleted.`);
    await viewSyncs(state);
  } else {
    await viewSync();
  }
}
