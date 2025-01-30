import pack from "../package.json";

export const state: State = {
  config: {
    syncs: [],
    tokens: [],
    initVersion: pack.version,
    version: "",
  },
  password: null,
};
