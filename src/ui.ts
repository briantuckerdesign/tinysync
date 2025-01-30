import * as p from "@clack/prompts";
import f from "picocolors";

// TODO: Move to own folder?

// Update the UI interface to include the additional spinner methods
interface UI {
  prompt: typeof p;
  format: typeof f;
  spinner: {
    start: (msg?: string) => void;
    stop: (msg?: string) => void;
    message: (msg: string) => void;
  };
}
export const ui = {
  prompt: p,
  format: f,
  spinner: (() => {
    const spinnerInstance = p.spinner(); // Create a single spinner instance
    return {
      start: (msg?: string) => spinnerInstance.start(msg),
      stop: (msg?: string) => spinnerInstance.stop(msg),
      message: (msg: string) => spinnerInstance.message(msg),
    };
  })(),
};
