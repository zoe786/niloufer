import { NextRequest, NextResponse } from "next/server";

/**
 * Google Cloud Speech-to-Text API integration
 * Converts speech audio to text with support for Indian accents and multilingual input
 */

export async function POST(request: NextRequest) {
  try {
    const { audio, language } = await request.json();

    if (!audio) {
      return NextResponse.json(
        { error: "Audio data is required" },
        { status: 400 }
      );
    }

    // Google Cloud Speech-to-Text endpoint
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!apiKey) {
      console.warn("Google Cloud API key not configured, using fallback");
      return NextResponse.json({ 
        transcript: "", 
        error: "Speech service unavailable" 
      });
    }

    // Decode base64 audio
    const audioContent = audio.replace(/^data:audio\/webm;base64,/, "");

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS",
            sampleRateHertz: 48000,
            languageCode: getLanguageCode(language),
            enableAutomaticPunctuation: true,
            model: "latest_long",
            useEnhanced: true,
          },
          audio: {
            content: audioContent,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Speech API error:", errorData);
      throw new Error("Speech recognition failed");
    }

    const data = await response.json();
    
    const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || "";

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Speech-to-text error:", error);
    return NextResponse.json(
      { transcript: "", error: "Failed to process speech" },
      { status: 500 }
    );
  }
}

function getLanguageCode(language: string): string {
  switch (language) {
    case "hi":
      return "hi-IN";
    case "te":
      return "te-IN";
    default:
      return "en-IN";
  }
}
