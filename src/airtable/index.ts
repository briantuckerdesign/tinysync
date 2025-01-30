/**
 * My version of Airtable client since I can't seem to get the official one to work.
 */

import { getBases } from "./get-bases";
import { getTables } from "./get-tables";
import { getRecords } from "./get-records";
import { updateRecord } from "./update-record";
import { createField } from "./create-field";
import { getRecord } from "./get-record";
import { getUpdatedSchema } from "./get-schema";
import { updateRecords } from "./update-records";

export const airtable = {
  getBases,
  getTables,
  getRecord,
  getRecords,
  getSchema: getUpdatedSchema,
  updateRecord,
  updateRecords,
  createField,
};
