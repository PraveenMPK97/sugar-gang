import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

interface RequestBody {
  patientName: string;
  patientRoomNo: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { patientName, patientRoomNo }: RequestBody = req.body;

    if (!patientName || !patientRoomNo) {
      return res.status(400).json({ error: 'Patient name and room number are required' });
    }

    try {
      // Insert new patient data into the patients table
      const result = await sql`
        INSERT INTO patients (patient_name, patient_room_no)
        VALUES (${patientName}, ${patientRoomNo})
        RETURNING *
      `;
      console.log("add Result",result);

      const patientDetailsResult = await sql`
      INSERT INTO patient_details (patient_id)
      VALUES (${result.rows[0].patient_id})
      RETURNING *
    `;
    const patientRemarksResult= await sql`
    INSERT INTO patient_remarks (patient_id)
    VALUES (${result.rows[0].patient_id})
    RETURNING *
  `;

      return res.status(200).json({
        message: 'Patient added successfully!',
        patient: result.rows[0]
      });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to add patient' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
