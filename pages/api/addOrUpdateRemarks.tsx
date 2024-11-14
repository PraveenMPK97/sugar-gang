import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

interface RequestBody {
  patientId: string;
  remarks: string;
  medications: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { patientId, remarks, medications }: RequestBody = req.body;

    try {
      await sql`
        INSERT INTO patient_remarks (patient_id, remarks, medications)
        VALUES (${patientId}, ${remarks}, ${medications})
        ON CONFLICT (patient_id) DO UPDATE
        SET remarks = EXCLUDED.remarks, medications = EXCLUDED.medications;
      `;
      res.status(200).json({ message: 'Patient remarks updated successfully!' });
    } catch (error) {
      console.error('Error saving remarks:', error);
      res.status(500).json({ error: 'Failed to save remarks' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
