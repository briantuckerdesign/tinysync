import pack from "../package.json";

export const state: State = {
  config: {
    syncs: [],
    tokens: [],
    initVersion: pack.version,
    version: "",
    selectedSync: undefined,
  },
  history: [],
  password: null,
};
