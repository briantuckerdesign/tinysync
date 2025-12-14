export interface OptionValidations {
    options: OptionValidation[]
}

export interface OptionValidation {
    name: string
    id: string
}

export function parseOption(
    value: any,
    validations: OptionValidations
): number {
    const valid = validateOption(value, validations)
    if (!valid) throw new Error(`The value for ${value} is not a valid option.`)

    return value
}

function validateOption(
    value: string,
    validations: OptionValidations
): boolean {
    const options = validations.options.map((option) => option.name)
    if (!options.includes(value)) return false

    return true
}
