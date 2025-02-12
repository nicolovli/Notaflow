export interface Subject extends CreateSubject {
    id: string
}

export interface CreateSubject {
    subject_code: string, 
    name: string, 
    description: string
}