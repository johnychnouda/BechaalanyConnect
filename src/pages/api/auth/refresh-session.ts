import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the current session
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ message: 'No session found' });
    }

    // Fetch fresh user data from Laravel backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.laravelToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch fresh user data');
    }

    const freshUserData = await response.json();

    // Return the fresh user data
    res.status(200).json({
      success: true,
      user: freshUserData,
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to refresh session' 
    });
  }
} 