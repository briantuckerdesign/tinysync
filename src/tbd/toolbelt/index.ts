import { parseRecordData } from './parse-record-data'
import { findSpecial } from './find-special-field'
import { encapsulateObjectForSelect } from './encapsulate-object-for-select'

export const toolbelt = {
    encapsulateObjectForSelect,
    findSpecial,
    parseRecordData,
}
