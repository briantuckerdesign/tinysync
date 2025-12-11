import type { PayloadFieldData } from 'webflow-api/api'

export type WebflowValidations = {
    maxLength?: number
    pattern?: Record<string, any>
    messages?: {
        pattern?: string
        maxLength?: string
    }
    format?: string // e.g. "decimal"
    precision?: number // e.g. 2 for decimal
    allowNegative?: boolean
    options?: string[] // For select fields
    collectionId?: string // For reference fields
    singleLine?: boolean // For text fields
}

export interface WebflowCreateItemResponse {
    items: [
        {
            id: string
            cmsLocaleId: string
            lastPublished: string | null
            lastUpdated: string
            createdOn: string
            isArchived: boolean
            isDraft: boolean
            fieldData: PayloadFieldData
        },
    ]
}

export interface FailedWebflowItemCreate {
    fieldData: PayloadFieldData
    error: any
}
