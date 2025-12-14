import { checkValidations } from './validations'

export interface NumberValidations {
    precision?: number
    allowNegative?: boolean
    format: 'integer' | 'decimal' // TODO: check this
}

export function parseNumber(
    value: any,
    validations: NumberValidations
): number {
    if (typeof value !== 'number') value = parseFloat(value)
    if (validations) value = checkValidations(value, validations)
    return value
}
