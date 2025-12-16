import { checkValidations } from './validations'

export interface TextValidations {
    maxLength?: number
    minLength?: number
    singleLine?: boolean
}

export function parseString(value: any, validations: TextValidations): string {
    if (typeof value !== 'string') value = value.toString()

    if (validations) {
        if (validations.singleLine) value = value.replace(/\n/g, ' ')
        checkValidations(value, validations)
    }

    return value
}
