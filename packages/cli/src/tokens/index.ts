import { decryptTokens } from './decrypt'
import { encryptTokens } from './encrypt'
import { loadTokens } from './load'
import { saveTokens } from './save'

// Re-export tokenFilePath from centralized paths utility
export { tokenFilePath } from '../utils/paths'

export const tokens = {
    load: loadTokens,
    save: saveTokens,
    encrypt: encryptTokens,
    decrypt: decryptTokens,
}
