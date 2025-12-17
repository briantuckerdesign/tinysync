import { checkValidations } from './validations'

export interface NumberValidations {
    precision?: number
    allowNegative?: boolean
    format: 'integer' | 'decimal'
}

export function parseNumber(
    value: any,
    validations: NumberValidations
): number {
    if (typeof value !== 'number') value = parseFloat(value)

    if (isNaN(value)) {
        throw new Error(`Cannot parse "${value}" as a number`)
    }

    if (validations) checkValidations(value, validations)

    return value
}
