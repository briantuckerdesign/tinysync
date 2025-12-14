import { checkValidations } from './validations'

export function parseMultiImage(value, validations) {
    if (validations) {
        const valid = checkValidations(value, validations)
        if (valid != true) throw new Error('Invalid multi-image field')
    }

    return value.map((image) => {
        return {
            url: image.url,
            alt: image.filename,
        }
    })
}
