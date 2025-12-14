import { checkValidations } from './validations'

export function parseBoolean(value: any, validations: any): boolean {
    if (validations) {
        const valid = checkValidations(value, validations)
        if (valid != true) throw new Error(`Validation failed: ${valid}`)
    }

    if (typeof value !== 'boolean') {
        if (value === 'true') value = true
        else if (value === 'false') value = false
        else if (value === 1) value = true
        else if (value === 0) value = false
        else value = Boolean(value)
    }

    return value
}
