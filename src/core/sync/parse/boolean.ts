import { checkValidations } from './validations'

export function parseBoolean(value: any, validations: any): boolean {
    if (validations) {
        value = checkValidations(value, validations)
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
