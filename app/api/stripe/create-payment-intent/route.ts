import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { amount } = await req.json();
  if (!amount || amount < 10) return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'mxn',
    metadata: { user_id: user.id },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
