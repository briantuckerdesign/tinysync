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
): string {
    const valid = validateOption(value, validations)
    if (!valid) {
        const allowedOptions = validations.options.map((o) => o.name).join(', ')
        throw new Error(
            `Invalid option "${value}". Allowed values: ${allowedOptions}`
        )
    }

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
