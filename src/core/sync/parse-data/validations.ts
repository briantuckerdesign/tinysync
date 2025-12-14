import type { NumberValidations } from './number'
import type { OptionValidations } from './option'
import type { RichTextValidations } from './richtext'
import type { TextValidations } from './string'

export type Validations =
    | TextValidations
    | RichTextValidations
    | OptionValidations
    | NumberValidations

export function checkValidations(
    parsedValue: any,
    validations: any
    // fetchedValue?: any
): true | string[] {
    try {
        const failedValidations: string[] = []
        if (validations.maxLength) {
            const valid = maxLength(parsedValue, validations.maxLength)
            if (!valid) failedValidations.push('maxLength')
        }
        if (validations.minLength) {
            const valid = minLength(parsedValue, validations.minLength)
            if (!valid) failedValidations.push('minLength')
        }
        if (validations.singleLine) {
            const valid = singleLine(parsedValue)
            if (!valid) failedValidations.push('single line')
        }
        if (validations.precision) {
            const valid = precision(parsedValue, validations.precision)
            if (!valid) failedValidations.push('precision')
        }
        if (validations.allowNegative) {
            const valid = allowNegative(parsedValue)
            if (!valid) failedValidations.push('allow negative')
        }

        //   if (validations.minImageSize) {
        //     parsedValue = minImageSize(
        //       parsedValue,
        //       fetchedValue,
        //       validations.minImageSize
        //     );
        //   }

        // TODO: minImageSize
        // TODO: maxImageSize
        // TODO: minImageWidth
        // TODO: maxImageWidth
        // TODO: minImageHeight
        // TODO: maxImageHeight
        // TODO: format (integer, decimal, date-time, options[{name}])

        if (failedValidations.length) return failedValidations

        return true
    } catch (error) {
        throw error
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
    if (value.includes('\n')) {
        value = value.replace(/\n/g, ' ')
        return false
    }
    return true
}

function precision(value: any, precision: number): boolean {
    if (value.toString().split('.')[1].length > precision) return false
    return true
}

function allowNegative(value: any): boolean {
    if (value < 0) return false
    return true
}

// function minImageSize(value: any, fetchedValue: any, minImageSize: number) {
//     if (fetchedValue[0] && fetchedValue[0].size) {
//         if (fetchedValue[0].size < minImageSize) {
//             throw new Error(
//                 `The image for ${value} is too small. It must be at least ${minImageSize} pixels.`
//             )
//         }
//     }
//     return value
// }
