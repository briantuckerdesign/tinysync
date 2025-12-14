import { checkValidations } from './validations'

export interface TextValidations {
    maxLength?: number
    minLength?: number
    singleLine?: boolean
}

export function parseString(value: any, validations: TextValidations): string {
    if (typeof value !== 'string') value = value.toString()

    if (validations) {
        if (validations.singleLine) value.replace(/\n/g, ' ')
        value = checkValidations(value, validations)
    }

    return value
}
