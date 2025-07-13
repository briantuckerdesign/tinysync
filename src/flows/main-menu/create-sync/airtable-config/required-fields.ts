import { airtable } from "../../../../airtable";
import { toolbelt } from "../../../../toolbelt";
import { ui } from "../../../../ui";
import { viewSyncs } from "../../view-syncs";

/**
 * Create or select fields to handle...
 * - State
 * - Last Published
 * - Slug
 * - Webflow Item ID
 */
export async function handleRequiredFields(
  base: AirtableBasesListItem,
  table: AirtableTable,
  accessToken: string
) {
  let allFields = JSON.parse(JSON.stringify(table.fields));

  // Adds [ Create for me ] to options
  // User can select an existing field
  // or tinySync can create one for them
  allFields.unshift({
    name: `${ui.format.italic("[ Create for me ]")}`,
    tsCreateField: "createForMe",
  });

  const stateField = await handleFieldCreation(
    base,
    table,
    accessToken,
    allFields.filter(
      (field) =>
        field.type === "singleLineText" ||
        field.type === "singleSelect" ||
        field.type === "formula" ||
        field.tsCreateField === "createForMe"
    ),
    "State",
    "Airtable field to store item state.",
    {
      name: "State [TinySync]",
      type: "singleSelect",
      description:
        "Tells TinySync how to proceed. Read the docs for more info.",
      options: {
        choices: [
          {
            name: "Not synced",
            color: "grayLight2",
          },
          {
            name: "Queued for sync",
            color: "redBright",
          },
          {
            name: "Always sync",
            color: "purpleBright",
          },
          {
            name: "Staging",
            color: "greenLight2",
          },
        ],
      },
    }
  );

  if (ui.prompt.isCancel(stateField)) {
    await viewSyncs();
    process.exit(0);
  }

  const slugField = await handleFieldCreation(
    base,
    table,
    accessToken,
    allFields.filter(
      (field) =>
        field.type === "singleLineText" || field.tsCreateField === "createForMe"
    ),
    "Slug",
    "Airtable field to store Webflow item slug.",
    {
      name: "Slug [TinySync]",
      type: "singleLineText",
      description: "Stores the Webflow item slug.",
    }
  );

  if (ui.prompt.isCancel(slugField)) {
    await viewSyncs();
    process.exit(0);
  }

  const webflowItemIdField = await handleFieldCreation(
    base,
    table,
    accessToken,
    allFields.filter(
      (field) =>
        field.type === "singleLineText" || field.tsCreateField === "createForMe"
    ),
    "Webflow Item ID",
    "Airtable field to store Webflow item ID.",
    {
      name: "Webflow Item ID [TinySync]",
      type: "singleLineText",
      description: "Stores the Webflow item ID.",
    }
  );

  if (ui.prompt.isCancel(webflowItemIdField)) {
    await viewSyncs();
    process.exit(0);
  }

  const lastPublishedField = await handleFieldCreation(
    base,
    table,
    accessToken,
    allFields.filter(
      (field) =>
        field.type === "dateTime" || field.tsCreateField === "createForMe"
    ),
    "Last Published",
    "Airtable field to store last published date/time.",
    {
      name: "Last Published [TinySync]",
      type: "dateTime",
      description: "Stores the last published date/time.",
      options: {
        timeZone: "client",
        dateFormat: {
          name: "local",
        },
        timeFormat: {
          name: "12hour",
        },
      },
    }
  );

  if (ui.prompt.isCancel(lastPublishedField)) {
    await viewSyncs();
    process.exit(0);
  }

  return {
    stateField,
    slugField,
    webflowItemIdField,
    lastPublishedField,
  };
}

async function handleFieldCreation(
  base: AirtableBasesListItem,
  table: AirtableTable,
  apiToken,
  compatibleFields,
  fieldName,
  description,
  fieldOptions
) {
  // State field:
  let field = (await ui.prompt.select({
    message: `${fieldName}: ${description}`,
    options: toolbelt.encapsulateObjectForSelect(compatibleFields),
  })) as any;

  if (ui.prompt.isCancel(field)) {
    await viewSyncs();
    process.exit(0);
  }

  // If user selects "Create for me" create the field
  if (field.tsCreateField) {
    ui.spinner.start(`Creating ${fieldName} field...`);
    const response = await airtable.createField(
      base.id,
      table.id,
      apiToken,
      fieldOptions
    );
    ui.spinner.stop(`✅ ${ui.format.dim(`${fieldName} field created.`)}`);

    field = response;
  }
  return field as AirtableField;
}
