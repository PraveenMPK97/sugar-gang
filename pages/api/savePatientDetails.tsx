import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { patientDetails } = req.body;

    // Validate input
    if (!Array.isArray(patientDetails) || patientDetails.length === 0) {
      return res.status(400).json({ error: 'Patient details are required' });
    }

    try {
      for (const detail of patientDetails) {
        if (!detail.detailId) {
          return res.status(400).json({ error: 'Each record must have a detailId' });
        }

        await sql`
          UPDATE patient_details
          SET 
            grbs = ${detail.grbs}, 
            grbs_datetime = ${detail.grbsDatetime}, 
            investigation = ${detail.investigation}, 
            investigation_value = ${detail.investigationValue}, 
            investigation_datetime = ${detail.investigationDatetime}
          WHERE 
            detail_id = ${detail.detailId};
        `;
      }

      res.status(200).json({ message: 'Patient details updated successfully' });
    } catch (error) {
      console.error('Error updating patient details:', error);
      res.status(500).json({ error: 'Failed to update patient details' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
