import { Webflow } from "webflow-api";
import { ui } from "../ui";

/**
 * Format:
 *
 * {
 *
 *   error: error,
 *
 *   location: string // Format: There was an error at {{location}}.
 *
 *   spinner?: boolean,
 *
 *   returnFunction?: function
 *
 * }
 */
// ... existing code ...

export async function webflowErrorHandler(settings: WebflowError) {
  const { error, location, spinner, returnFunction } = settings;

  // Stop spinner if it exists
  if (spinner) ui.spinner.stop();

  // Handle Webflow specific errors
  if (
    error instanceof Webflow.ForbiddenError ||
    error instanceof Webflow.BadRequestError
  ) {
    ui.prompt.log.error(`There was an error ${location}.`);

    if (isWebflowError(error)) {
      ui.prompt.log.error(error.body.message);
      logAdditionalErrorDetails(error.body);
      if (returnFunction) await returnFunction();
      return;
    }
  }

  // Handle fatal errors
  ui.prompt.log.error(
    "There was a fatal error validating your Webflow access token."
  );

  if (isWebflowError(error)) {
    ui.prompt.log.error(error.body.code);
    ui.prompt.log.error(error.body.message);
    logAdditionalErrorDetails(error.body);
  } else {
    ui.prompt.log.error(JSON.stringify(error));
  }

  ui.prompt.outro();
  process.exit(1);
}

function logAdditionalErrorDetails(body: ExpectedError) {
  if (body.externalReference) {
    ui.prompt.log.error(`External Reference: ${body.externalReference}`);
  }
  if (body.details && body.details.length > 0) {
    ui.prompt.log.error("Additional Details:");
    body.details.forEach((detail) =>
      ui.prompt.log.error(JSON.stringify(detail))
    );
  }
}

// Type guard for Webflow API errors
function isWebflowError(error: unknown): error is { body: ExpectedError } {
  return (
    typeof error === "object" &&
    error !== null &&
    "body" in error &&
    typeof error.body === "object" &&
    error.body !== null &&
    "message" in error.body
  );
}

// ... existing code ...

interface WebflowError {
  error: unknown;
  location: string /* Format: There was an error at {{location}}. */;
  spinner?: boolean /* whether to stop the spinner */;
  returnFunction?: () => void /* a function to run after the error is handled */;
}

// ok so I know the type now:
interface ExpectedError {
  code?:
    | "bad_request"
    | "collection_not_found"
    | "conflict"
    | "duplicate_collection"
    | "duplicate_user_email"
    | "ecommerce_not_enabled"
    | "forbidden"
    | "forms_require_republish"
    | "incompatible_webhook_filter"
    | "internal_error"
    | "invalid_auth_version"
    | "invalid_credentials"
    | "invalid_domain"
    | "invalid_user_email"
    | "item_not_found"
    | "missing_scopes"
    | "no_domains"
    | "not_authorized"
    | "not_enterprise_plan_site"
    | "not_enterprise_plan_workspace"
    | "order_not_found"
    | "resource_not_found"
    | "too_many_requests"
    | "unsupported_version"
    | "unsupported_webhook_trigger_type"
    | "user_limit_reached"
    | "user_not_found"
    | "users_not_enabled"
    | "validation_error";
  message?: string;
  externalReference?: string;
  details?: any[];
}
