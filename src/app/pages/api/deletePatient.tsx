import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { patientId } = req.query;

    // Ensure patientId is a string
    if (typeof patientId !== 'string') {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    try {
      await sql`
        DELETE FROM patients WHERE patient_id = ${patientId}
      `;
      res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
      console.error('Error deleting patient:', error);
      res.status(500).json({ error: 'Error deleting patient' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
