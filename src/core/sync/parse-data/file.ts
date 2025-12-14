import { checkValidations } from './validations'

/**
 * Parses the file field of a record and updates the recordData object.
 *
 * Passes filename as alt.
 */
export function parseFile(value: any[], validations: any) {
    if (validations) {
        const valid = checkValidations(value, validations)
        if (valid != true) throw new Error('Invalid file field')
    }

    return {
        url: value[0].url,
        alt: value[0].filename,
    }
}
