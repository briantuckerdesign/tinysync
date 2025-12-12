import type { WebflowClient } from 'webflow-api'
import type { Sync, Token } from '../core/types'

export interface State {
    tokens: Token[]
    syncs: Sync[]
    version: string
    activeSync: Sync | undefined
    history: any
    password: string | null
    webflowClient: WebflowClient | undefined
}

export interface EncryptedData {
    version?: string
    passwordHash?: string
    encryptedData?: string
    iv?: string
    authTag?: string
    salt?: string
}
