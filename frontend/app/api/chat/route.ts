import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[API] Received request');
    const { message, session_id } = await request.json();
    
    if (!message) {
      console.error('[API] No message provided');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('[API] Forwarding to Flask backend:', { messageLength: message.length, hasSessionId: !!session_id });
    
    try {
      const response = await fetch('http://localhost:5000/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message, 
          session_id: session_id || 'default-session' 
        }),
      });

      console.log(`[API] Backend response status: ${response.status}`);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.text();
          console.error('[API] Backend error response:', errorData);
          // Try to parse as JSON, if it fails, use the text as error message
          try {
            const jsonError = JSON.parse(errorData);
            return NextResponse.json(
              { error: jsonError.error || 'Backend processing failed' },
              { status: response.status }
            );
          } catch (e) {
            return NextResponse.json(
              { error: `Backend error: ${errorData}` },
              { status: response.status }
            );
          }
        } catch (e) {
          console.error('[API] Error reading error response:', e);
          return NextResponse.json(
            { error: `Failed to process request (${response.status})` },
            { status: response.status }
          );
        }
      }

      const data = await response.json().catch(async (e) => {
        console.error('[API] Failed to parse JSON response:', e);
        const text = await response.text();
        console.error('[API] Response text:', text);
        throw new Error('Invalid JSON response from backend');
      });

      console.log('[API] Successfully processed request');
      return NextResponse.json(data);
      
    } catch (fetchError) {
      console.error('[API] Fetch error:', fetchError);
      return NextResponse.json(
        { 
          error: `Failed to connect to backend: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
          details: process.env.NODE_ENV === 'development' ? (fetchError as Error)?.stack : undefined
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('[API] Route handler error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.stack : undefined
      },
      { status: 500 }
    );
  }
}