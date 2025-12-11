/* -------------------------------------------------------------------------- */
/*                                    Utils                                   */
/* -------------------------------------------------------------------------- */
import { parseRecordData } from './parse-record-data'
import { filterByPropertyPath } from './filter-by-property-path'
import { findSpecial } from './find-special-field'
import { encapsulateObjectForSelect } from './encapsulate-object-for-select'

export const toolbelt = {
    encapsulateObjectForSelect,
    findSpecial,
    filterByPropertyPath,
    parseRecordData,
}
