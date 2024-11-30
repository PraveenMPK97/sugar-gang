import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const { rows } = await sql`
                SELECT * FROM patients
            `;
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error fetching patients:', error);
            res.status(500).json({ error: 'Error fetching patients' });
        }
    } else if (req.method === 'POST') {
        const { patientId, age, consultant, diagnosis, comorbidities, grbs, grbsDatetime, investigation, investigationValue, investigationDatetime } = req.body;

        // Validate required fields
        if (!patientId || !consultant || !diagnosis) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!grbs && !investigation) {
            return res.status(400).json({ error: 'Please provide either GRBS or Investigation details' });
        }

        try {
            // Update the patients table with provided fields
            const result = await sql`
                UPDATE patients
                SET 
                    age = ${age},
                    consultant = ${consultant}, 
                    diagnosis = ${diagnosis}, 
                    comorbidities = ${comorbidities}
                WHERE patient_id = ${patientId}
            `;

            // If no rows were affected, return an error
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            // Prepare values for the patient_details table
            let grbsUpdate = grbs ? grbs : null;
            let grbsDatetimeUpdate = grbs ? grbsDatetime : null;
            let investigationValueUpdate = investigation ? investigationValue : null;
            let investigationDatetimeUpdate = investigation ? investigationDatetime : null;

            // Update or insert into the patient_details table
            const patientDetailsResult = await sql`
                INSERT INTO patient_details (
                    patient_id, 
                    grbs, 
                    grbs_datetime, 
                    investigation,
                    investigation_value, 
                    investigation_datetime
                ) VALUES (
                    ${patientId}, 
                    ${grbsUpdate}, 
                    ${grbsDatetimeUpdate}, 
                    ${investigation},
                    ${investigationValueUpdate},
                    ${investigationDatetimeUpdate}
                )
            `;

            console.log("patient details result", patientDetailsResult);

            res.status(200).json({ message: 'Patient details updated successfully!' });
        } catch (error) {
            console.error('Error updating patient details:', error);
            res.status(500).json({ error: 'Error updating patient details' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
