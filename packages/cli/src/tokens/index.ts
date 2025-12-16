import { join } from 'path'
import { decryptTokens } from './decrypt'
import { encryptTokens } from './encrypt'
import { loadTokens } from './load'
import { saveTokens } from './save'

// Use import.meta.dir to resolve relative to this package, not cwd
export const tokenFilePath = join(import.meta.dir, '../../data/tokens.json')

export const tokens = {
    load: loadTokens,
    save: saveTokens,
    encrypt: encryptTokens,
    decrypt: decryptTokens,
}
