import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, medicalRecords, patientAddress } = await request.json();
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Build system prompt with medical context
    const systemPrompt = `You are a helpful AI medical assistant for a blockchain-based patient records system called Hyperion. 

IMPORTANT GUIDELINES:
- You can help patients understand their medical records and provide general health information
- Always clarify that you're an AI assistant and cannot replace professional medical advice
- Encourage users to consult healthcare providers for serious concerns
- Be empathetic, clear, and use simple language
- If asked about specific records, reference the data provided below

PATIENT CONTEXT:
- Patient Address: ${patientAddress}
- Total Medical Records: ${medicalRecords.length}

MEDICAL RECORDS SUMMARY:
${medicalRecords.length > 0 
  ? medicalRecords.map((r: any, idx: number) => 
      `${idx + 1}. ${r.type} (${r.date})\n   Diagnosis: ${r.diagnosis}\n   Treatment: ${r.treatment}`
    ).join('\n\n')
  : 'No medical records available yet.'
}

Remember: Be helpful but always recommend professional medical consultation for medical decisions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get AI response' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
