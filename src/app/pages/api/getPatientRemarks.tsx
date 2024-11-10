import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { patientId } = req.query;

    // Ensure patientId is a string
    if (typeof patientId !== 'string') {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    try {
      const { rows } = await sql`
        SELECT remarks, medications FROM patient_remarks WHERE patient_id = ${patientId}
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Remarks not found for the patient' });
      }

      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Error fetching remarks:', error);
      res.status(500).json({ error: 'Error fetching remarks' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
