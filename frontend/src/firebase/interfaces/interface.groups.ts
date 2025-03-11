export interface Group { 
    members: string[], 
    createdAt: Date,
    shared_notes: SharedNote[]
}

export interface SharedNote { 
    shared_by: string, 
    note_id: string, 
    date: Date
}