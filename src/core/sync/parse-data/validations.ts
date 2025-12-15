import type { NumberValidations } from './number'
import type { OptionValidations } from './option'
import type { RichTextValidations } from './richtext'
import type { TextValidations } from './string'

export type Validations =
    | TextValidations
    | RichTextValidations
    | OptionValidations
    | NumberValidations

/**
 * Validates a parsed value against the provided validation rules.
 * Throws an error with details if any validation fails.
 */
export function checkValidations(parsedValue: any, validations: any): void {
    const failedValidations: string[] = []

    if (validations.maxLength != null) {
        if (!maxLength(parsedValue, validations.maxLength)) {
            failedValidations.push(
                `exceeds max length of ${validations.maxLength}`
            )
        }
    }
    if (validations.minLength != null) {
        if (!minLength(parsedValue, validations.minLength)) {
            failedValidations.push(
                `below min length of ${validations.minLength}`
            )
        }
    }
    if (validations.singleLine) {
        if (!singleLine(parsedValue)) {
            failedValidations.push('must be single line (contains newlines)')
        }
    }
    if (validations.precision != null) {
        if (!precision(parsedValue, validations.precision)) {
            failedValidations.push(
                `exceeds precision of ${validations.precision} decimal places`
            )
        }
    }
    if (validations.allowNegative === false) {
        if (!allowNegative(parsedValue)) {
            failedValidations.push('negative values not allowed')
        }
    }

    if (failedValidations.length > 0) {
        throw new Error(`Validation failed: ${failedValidations.join(', ')}`)
    }
}

function maxLength(value: any, maxLength: number): boolean {
    if (typeof value !== 'string') return false
    if (value.length > maxLength) return false
    return true
}

function minLength(value: any, minLength: number): boolean {
    if (typeof value !== 'string') return false
    if (value.length < minLength) return false
    return true
}

function singleLine(value: any): boolean {
    return !value.includes('\n')
}

function precision(value: any, precision: number): boolean {
    const parts = value.toString().split('.')
    if (parts.length < 2) return true // No decimal part
    if (parts[1].length > precision) return false
    return true
}

function allowNegative(value: any): boolean {
    return value >= 0
}
