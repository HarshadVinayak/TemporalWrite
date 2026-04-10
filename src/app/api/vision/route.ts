import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json(); // base64 image

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const base64Data = image.split(',')[1] || image;

    const prompt = `Analyze this handwritten student work or text-heavy image. 
Identify grammar, spelling, and punctuation errors.
For each error, provide:
1. rect: { x, y, width, height } in percentage (0-100) of the image.
2. error: The incorrect text found.
3. correction: The fixed version.
4. explanation: Why it is wrong.

Return ONLY a JSON array of errors.
Format: [ { "rect": { "x": 10, "y": 20, "w": 30, "h": 5 }, "error": "cat sat", "correction": "The cat sat", "explanation": "Missing article." } ]`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response text
    const jsonMatch = text.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error('Could not parse Vision AI response.');
    }

    const errors = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ errors });
  } catch (error: any) {
    console.error('Vision API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
