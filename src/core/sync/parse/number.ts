import { checkValidations } from './validations'

export function parseNumber(value: any, validations): number {
    if (typeof value !== 'number') value = parseFloat(value)
    if (validations) value = checkValidations(value, validations)
    return value
}
