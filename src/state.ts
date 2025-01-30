import pack from "../package.json";

export const state: State = {
  config: {
    syncs: [],
    keys: [],
    initVersion: pack.version,
    version: "",
  },
  password: null,
};
