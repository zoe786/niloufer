import { NextRequest, NextResponse } from "next/server";

/**
 * Google Cloud Text-to-Speech API integration
 * Generates natural-sounding speech with support for Indian English voices
 */

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!apiKey) {
      console.warn("Google Cloud API key not configured");
      return NextResponse.json({ 
        audioContent: null, 
        error: "TTS service unavailable" 
      });
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            text: text,
          },
          voice: getVoiceConfig(language),
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.95,
            pitch: 0,
            volumeGainDb: 2,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google TTS API error:", errorData);
      throw new Error("Text-to-speech failed");
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      audioContent: data.audioContent,
      mimeType: "audio/mp3"
    });
  } catch (error) {
    console.error("Text-to-speech error:", error);
    return NextResponse.json(
      { audioContent: null, error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}

function getVoiceConfig(language: string) {
  switch (language) {
    case "hi":
      return {
        languageCode: "hi-IN",
        name: "hi-IN-Standard-A",
        ssmlGender: "FEMALE",
      };
    case "te":
      return {
        languageCode: "te-IN",
        name: "te-IN-Standard-A",
        ssmlGender: "FEMALE",
      };
    default:
      // Indian English voice with natural sound
      return {
        languageCode: "en-IN",
        name: "en-IN-Neural2-A",
        ssmlGender: "FEMALE",
      };
  }
}
