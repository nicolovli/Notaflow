import { createSubject } from "../func/subject";
import { CreateSubject } from "../interfaces/interface.subject";

export const createNewSubject = async (): Promise<string> => { 

    const subjectObj: CreateSubject = {
        subject_code: "tma4140", 
        name: "Statistikk",
        description: "Praktisk og teoretisk forståelse for programvareproduktutvikling for små, samlokaliserte utviklingsteam, med spesiell fokus på utviklingsprosesser, kravarbeid, programvarekvalitet og teknologivalg."
    }

    const response = await createSubject(subjectObj);
    return response;
}
