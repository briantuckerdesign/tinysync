import { checkValidations } from './validations'

/**
 * Parses the image field of a record and updates the recordData object.
 *
 * Passes filename as alt.
 */
export function parseImage(value: any[], validations: any) {
    if (validations) {
        const valid = checkValidations(value, validations)
        if (valid != true) throw new Error('Invalid image field')
    }

    return {
        url: value[0].url,
        alt: value[0].filename,
    }
}
