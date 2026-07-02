import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { verifyBearerToken } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyBearerToken(req.headers.get('authorization'));
    const body = await req.json();
    const question = String(body.question ?? '').slice(0, 2000);
    const data = body.data ?? {};
    if (!question) return NextResponse.json({ error: 'Question manquante.' }, { status: 400 });
    const allowed = (process.env.ALLOWED_EMAILS || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
    if (allowed.length && !allowed.includes(String(user.email || '').toLowerCase())) {
      return NextResponse.json({ error: 'Compte non autorisé pour l’IA.' }, { status: 403 });
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: [
        { role: 'system', content: 'Tu es un directeur financier personnel. Réponds en français ou en anglais selon la langue de la question. Ne donne pas de conseil financier réglementé; aide à budgéter, prévoir les flux et prioriser les dettes. Sois concret, prudent, et chiffres tes recommandations.' },
        { role: 'user', content: `Question: ${question}\n\nDonnées financières JSON:\n${JSON.stringify(data).slice(0, 25000)}` }
      ]
    });
    return NextResponse.json({ answer: response.output_text });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur IA.' }, { status: 500 });
  }
}
