import Airtable from "airtable";
import { WebflowClient } from "webflow-api";
import { Collection, Domain, Field, Site } from "webflow-api/api";
import { checkCompatibility } from "../config-tools/check-compatibility";

export {};

declare global {
  interface WebflowField extends Field {
    validations?: any;
    type: FieldType | "VideoLink";
  }
  interface ConfigTools {
    save: typeof saveConfig;
    load: typeof loadConfig;
    secure: typeof secure;
    checkCompatibility: typeof checkCompatibility;
  }

  interface State {
    config: Config;
    password: string | null;
    webflowClient?: WebflowClient;
  }

  interface Config {
    syncs: Array<Sync>;
    tokens: Array<Key>;
    initVersion: string;
    version: string;
    encryptedData?: any;
  }

  interface Key {
    label: string;
    name?: string; // needed for clack occasionally
    value: string;
    platform: string;
    id: string;
  }

  interface Sync {
    id: string;
    name: string;
    autoPublish: boolean;
    deleteRecords: boolean;
    publishToSubdomain: boolean | undefined;
    errors: Array<any>;
    fields: Array<MatchedField>;
    airtable: {
      accessToken: string;
      base: {
        id: string;
        name: string;
      };
      table: {
        id: string;
        name: string;
        view: AirtableView;
        fields: Array<any>;
        primaryFieldId: string;
        slugFieldId: string;
        lastPublishedFieldId: string;
        stateFieldId: string;
        itemIdFieldId: string;
      };
    };
    webflow: {
      api?: WebflowClient;
      accessToken: string;
      site: {
        id: string;
        name: string | undefined;
        customDomains: Domain[] | undefined;
      };
      collection: {
        id: string;
        slug: string | undefined;
        name: string | undefined;
        fields: Array<WebflowField>;
      };
    };
  }

  interface MatchedField {
    webflow?: {
      slug?: string;
      displayName: string;
      id: string;
      type: string;
      validations?: any;
    };
    airtable: {
      name: string;
      id: string;
      type: string;
      options: any;
    };
    specialField: SpecialField;
  }

  type SpecialField = "lastPublished" | "itemId" | "state" | "slug" | "name";

  interface SyncSettings {
    syncName: string;
    autoPublish: boolean;
    deleteRecords: boolean;
    publishToSubdomain?: boolean;
  }

  interface FieldOld {
    webflowSlug: string;
    airtableName: string;
    webflowName: string;
    airtableId: string;
    webflowId: string;
    airtableType: string;
    webflowType: string;
    validations: any;
    options: any;
    specialField: string | null;
  } // TODO: remove

  /* --------------------------------- Webflow -------------------------------- */

  interface WebflowConfig {
    accessToken: string;
    site: Site;
    collection: Collection;
    recordIdField: Field;
  }

  /* -------------------------------- Airtable -------------------------------- */
  interface AirtableConfig {
    accessToken: string;
    base: AirtableBasesListItem;
    table: AirtableTable;
    view: AirtableView;
    stateField: AirtableField;
    slugField: AirtableField;
    webflowItemIdField: AirtableField;
    lastPublishedField: AirtableField;
  }

  interface AirtableBases {
    bases: Array<AirtableBasesListItem>;
    offset?: string;
  }

  interface AirtableBasesListItem {
    id: string;
    name: string;
    permissionLevel: "none" | "read" | "comment" | "edit" | "create";
  }

  interface AirtableBase {
    tables: Array<AirtableTable>;
  }

  interface AirtableTable {
    id: string;
    primaryFieldId: string;
    name: string;
    description?: string;
    fields: Array<AirtableField>;
    views: Array<AirtableView>;
  }

  interface AirtableField {
    id: string;
    type:
      | "singleLineText"
      | "email"
      | "url"
      | "multilineText"
      | "number"
      | "percent"
      | "currency"
      | "singleSelect"
      | "multipleSelects"
      | "singleCollaborator"
      | "multipleCollaborators"
      | "multipleRecordLinks"
      | "date"
      | "dateTime"
      | "phoneNumber"
      | "multipleAttachments"
      | "checkbox"
      | "formula"
      | "createdTime"
      | "rollup"
      | "count"
      | "lookup"
      | "multipleLookupValues"
      | "autoNumber"
      | "barcode"
      | "rating"
      | "richText"
      | "duration"
      | "lastModifiedTime"
      | "button"
      | "createdBy"
      | "lastModifiedBy"
      | "externalSyncSource"
      | "aiText";
    name: string;
    description?: string;
    options?: any; // TODO: type
  }

  interface AirtableView {
    id: string;
    name: string;
    /**
     * Block is Gaant View
     */
    type:
      | "grid"
      | "form"
      | "calendar"
      | "gallery"
      | "kanban"
      | "timeline"
      | "block";
    /**
     * Available on grid views only: list of visible (non-hidden) field IDs, when requested with include query paremeter
     */
    visibleFieldIds?: Array<string>;
  }

  interface AirtableRecord {
    id: string;
    /** A date timestamp in the ISO format, eg:"2018-01-01T00:00:00.000Z" */
    createdTime: string;
    fields: Record<AirtableFieldId, any>;
    error?: string;
  }

  interface SyncRecords {
    toCreate: AirtableRecord[];
    toUpdate: AirtableRecord[];
    withErrors: AirtableRecord[];
    toDelete: AirtableRecord[];
    toPublish: AirtableRecord[];
    toUpdateInAirtable?: AirtableRecord[];
  }
}

type AirtableFieldId = string;
