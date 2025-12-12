import { decryptTokens } from './decrypt'
import { encryptTokens } from './encrypt'
import { loadTokens } from './load'
import { saveTokens } from './save'

export const tokenFilePath = './src/cli/data/tokens.json'

export const tokens = {
    load: loadTokens,
    save: saveTokens,
    encrypt: encryptTokens,
    decrypt: decryptTokens,
}
