export interface Group { 
    id: string, 
    members: string[], 
    name: string,
    createdAt: Date,
    shared_notes: SharedNote[]
}

export interface SharedNote { 
    shared_by: string, 
    note_id: string, 
    date: Date
}