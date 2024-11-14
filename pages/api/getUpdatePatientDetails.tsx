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
        const { patientId, consultant, diagnosis, comorbidities, grbs, grbsDatetime, investigation, investigationDatetime } = req.body;

        // Validate required fields
        if (!patientId || !consultant || !diagnosis || !grbs) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const result = await sql`
                UPDATE patients
                SET 
                    consultant = ${consultant}, 
                    diagnosis = ${diagnosis}, 
                    comorbidities = ${comorbidities} 
                    
                WHERE 
                    patient_id = ${patientId}
            `;

            const patientDetailsResult = await sql`
                UPDATE patient_details
                SET 
                    grbs = ${grbs}, 
                    grbs_datetime = ${grbsDatetime}, 
                    investigation = ${investigation}, 
                    investigation_datetime = ${investigationDatetime}
                WHERE 
                    patient_id = ${patientId}
            `;
            console.log("patient details result",patientDetailsResult);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Patient not found' });
            }
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
