export interface AirtableBasesResponse {
    bases: Array<AirtableBasesListItem>
    offset?: string
}

export interface AirtableBasesListItem {
    id: string
    name: string
    permissionLevel: AirtablePermissionLevel
}

export type AirtablePermissionLevel =
    | 'none'
    | 'read'
    | 'comment'
    | 'edit'
    | 'create'

export interface AirtableBase {
    tables: Array<AirtableTable>
}

export interface AirtableTable {
    id: string
    primaryFieldId: string
    name: string
    description?: string
    fields: Array<AirtableField>
    views: Array<AirtableView>
}

interface AirtableView {
    id: string
    name: string
    /**
     * Block is Gaant View
     */
    type:
        | 'grid'
        | 'form'
        | 'calendar'
        | 'gallery'
        | 'kanban'
        | 'timeline'
        | 'block'
    /**
     * Available on grid views only: list of visible (non-hidden) field IDs, when requested with include query paremeter
     */
    visibleFieldIds?: Array<string>
}

export type AirtableFieldType =
    | 'singleLineText'
    | 'email'
    | 'url'
    | 'multilineText'
    | 'number'
    | 'percent'
    | 'currency'
    | 'singleSelect'
    | 'multipleSelects'
    | 'singleCollaborator'
    | 'multipleCollaborators'
    | 'multipleRecordLinks'
    | 'date'
    | 'dateTime'
    | 'phoneNumber'
    | 'multipleAttachments'
    | 'checkbox'
    | 'formula'
    | 'createdTime'
    | 'rollup'
    | 'count'
    | 'lookup'
    | 'multipleLookupValues'
    | 'autoNumber'
    | 'barcode'
    | 'rating'
    | 'richText'
    | 'duration'
    | 'lastModifiedTime'
    | 'button'
    | 'createdBy'
    | 'lastModifiedBy'
    | 'externalSyncSource'
    | 'aiText'

export interface AirtableField {
    id?: string
    type: AirtableFieldType
    name: string
    description?: string
    options?: any
}

export interface AirtableRecord {
    id: string
    createdTime: string
    fields: Record<string, any>
    error?: string
}

export interface AirtableRecordResponse extends AirtableRecord {
    details?: {
        message: string
        reasons: AirtableRecordReason[]
    }
}
type AirtableRecordReason =
    | 'attachmentsFailedUploading'
    | 'attachmentUploadRateIsTooHigh'
