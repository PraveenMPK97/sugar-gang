import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { patientId, patientDetails } = req.body;

        // Validate required fields
        if (!patientId || !Array.isArray(patientDetails) || patientDetails.length === 0) {
            return res.status(400).json({ error: 'Patient ID and details are required' });
        }

        try {
            for (const detail of patientDetails) {
                await sql`
                    INSERT INTO patient_details (patient_id, grbs, grbs_datetime, investigation, investigation_datetime)
                    VALUES (${patientId}, ${detail.grbs}, ${detail.grbsDatetime}, ${detail.investigation}, ${detail.investigationDatetime})
                    ON CONFLICT (detail_id) DO UPDATE
                    SET grbs = EXCLUDED.grbs, 
                        grbs_datetime = EXCLUDED.grbs_datetime,
                        investigation = EXCLUDED.investigation, 
                        investigation_datetime = EXCLUDED.investigation_datetime;
                `;
            }
            res.status(200).json({ message: 'Patient details saved successfully' });
        } catch (error) {
            console.error('Error saving patient details:', error);
            res.status(500).json({ error: 'Failed to save patient details' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
