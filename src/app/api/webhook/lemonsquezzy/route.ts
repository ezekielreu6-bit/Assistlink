import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  const payload = await req.json();
  const eventName = payload.meta.event_name;
  const orgId = payload.meta.custom_data.orgId; 

  if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
    const status = payload.data.attributes.status; 
    const variantId = payload.data.attributes.variant_id;

    await updateDoc(doc(db, 'organizations', orgId), {
      plan: status === 'active' ? 'pro' : 'free',
      lemonsqueezyId: payload.data.id,
      
      extraSeats: variantId === 'YOUR_VARIANT_ID' ? 10 : 0 
    });
  }

  return NextResponse.json({ received: true });
}