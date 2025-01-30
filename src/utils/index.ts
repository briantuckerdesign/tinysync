/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */
import { parseRecordData } from "./parse-record-data";
import { filterByPropertyPath } from "./filter-by-property-path";
import { findSpecial } from "./find-special-field";
import { encapsulateObjectForSelect } from "./encapsulate-object-for-select";
import { welcomeMessage } from "./welcome-message";

export const utils = {
  welcomeMessage,
  encapsulateObjectForSelect,
  findSpecial,
  filterByPropertyPath,
  parseRecordData,
};
