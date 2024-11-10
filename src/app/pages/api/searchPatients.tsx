import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { searchTerm } = req.query;

        // Ensure searchTerm is a string
        if (typeof searchTerm !== 'string') {
            return res.status(400).json({ error: 'Invalid search term' });
        }

        try {
            const query = `%${searchTerm}%`;
            const { rows } = await sql`
                SELECT * FROM patients
                WHERE patient_name ILIKE ${query}
                   OR patient_room_no::text ILIKE ${query}
                   OR consultant ILIKE ${query}
            `;
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error fetching patients:', error);
            res.status(500).json({ error: 'Error fetching patients' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
