'use server';

import { db } from '@/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;

export async function reportAgentUsage(orgId: string, minutesWorked: number) {
  try {
    const orgRef = doc(db, 'organizations', orgId);
    const orgSnap = await getDoc(orgRef);
    
    if (!orgSnap.exists()) return;
    const data = orgSnap.data();

    
    const subscriptionItemId = data.lemonsqueezyUsageItemId; 
    if (!subscriptionItemId) return;

    
    const hours = minutesWorked / 60;

    const response = await fetch('https://api.lemonsqueezy.com/v1/usage-records', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`
      },
      body: JSON.stringify({
        data: {
          type: 'usage-records',
          attributes: {
            quantity: hours,
            action: 'increment' 
          },
          relationships: {
            'subscription-item': {
              data: {
                type: 'subscription-items',
                id: subscriptionItemId.toString()
              }
            }
          }
        }
      })
    });

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Billing Error:", error);
    return { success: false };
  }
}