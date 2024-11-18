import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { searchTerm } = req.query;
        console.log("search term", searchTerm);
        
        if (typeof searchTerm !== 'string') {
            return res.status(400).json({ error: 'Invalid search term' });
        }

        try {
            const query = `%${searchTerm}%`;
            const { rows } = await sql`
                SELECT 
                    patients.patient_id AS "patientId",
                    patients.patient_name AS "patientName",
                    patients.patient_room_no AS "patientRoomNo",
                    patients.consultant AS "consultant",
                    patients.diagnosis AS "diagnosis",
                    patients.comorbidities AS "comorbidities",
                    patient_details.detail_id AS "detailId",
                    patient_details.grbs AS "grbs",
                    patient_details.grbs_datetime AS "grbsDatetime",
                    patient_details.investigation AS "investigation",
                    patient_details.investigation_value AS "investigationValue",
                    patient_details.investigation_datetime AS "investigationDatetime"
                FROM 
                    patients
                LEFT JOIN 
                    patient_details 
                ON 
                    patients.patient_id = patient_details.patient_id
                WHERE 
                    patients.patient_name ILIKE ${query}
                    OR patients.patient_room_no::text ILIKE ${query}
                    OR patients.consultant ILIKE ${query}
            `;
            
            // Process rows into structured response
            const patientsMap = new Map<number, {
                patientId: number;
                patientName: string;
                patientRoomNo: string;
                consultant: string;
                diagnosis: string;
                comorbidities: string;
                patientDetails: {
                    detailId: number | null;
                    grbs: number | null;
                    grbsDatetime: string | null;
                    investigation: string | null;
                    investigationValue: number | null;
                    investigationDatetime: string | null;
                }[];
            }>();

            rows.forEach(row => {
                const {
                    patientId,
                    patientName,
                    patientRoomNo,
                    consultant,
                    diagnosis,
                    comorbidities,
                    detailId,
                    grbs,
                    grbsDatetime,
                    investigation,
                    investigationValue,
                    investigationDatetime
                } = row;

                if (!patientsMap.has(patientId)) {
                    patientsMap.set(patientId, {
                        patientId,
                        patientName,
                        patientRoomNo,
                        consultant,
                        diagnosis,
                        comorbidities,
                        patientDetails: []
                    });
                }

                // Add patient detail if it exists
                if (grbs || grbsDatetime || investigation || investigationDatetime) {
                    patientsMap.get(patientId)?.patientDetails.push({
                        detailId,
                        grbs,
                        grbsDatetime,
                        investigation,
                        investigationValue,
                        investigationDatetime
                    });
                }
            });

            const patients = Array.from(patientsMap.values());

            console.log('Formatted patients data:', patients);
            res.status(200).json(patients);
        } catch (error) {
            console.error('Error fetching patients:', error);
            res.status(500).json({ error: 'Error fetching patients' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
