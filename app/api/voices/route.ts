import { NextRequest, NextResponse } from 'next/server';

// Exhaustive global mapping of all Retell speech locales to clean display labels
const localeDisplayNames: Record<string, string> = {
  'en-US': 'English (US)',
  'es-ES': 'Spanish (Spain)',
  'es-MX': 'Spanish (Latin America)',
  'es-419': 'Spanish (Latin America)',
  'en-IN': 'English (India)',
  'en-GB': 'English (UK)',
  'en-AU': 'English (Australia)',
  'en-NZ': 'English (New Zealand)',
  'en-CA': 'English (Canada)',
  'fr-FR': 'French (France)',
  'fr-CA': 'French (Canada)',
  'zh-CN': 'Chinese (China)',
  'zh-HK': 'Cantonese (China)',
  'de-DE': 'German (Germany)',
  'hi-IN': 'Hindi (India)',
  'ja-JP': 'Japanese (Japan)',
  'pt-PT': 'Portuguese (Portugal)',
  'pt-BR': 'Portuguese (Brazil)',
  'ru-RU': 'Russian (Russia)',
  'it-IT': 'Italian (Italy)',
  'ko-KR': 'Korean (South Korea)',
  'lv-LV': 'Latvian (Latvia)',
  'cs-CZ': 'Czech (Czech Republic)',
  'lt-LT': 'Lithuanian (Lithuania)',
  'nl-NL': 'Dutch (Netherlands)',
  'nl-BE': 'Dutch (Belgium)',
  'pl-PL': 'Polish (Poland)',
  'tr-TR': 'Turkish (Turkey)',
  'vi-VN': 'Vietnamese',
  'ro-RO': 'Romanian (Romania)',
  'da-DK': 'Danish (Denmark)',
  'fi-FI': 'Finnish (Finland)',
  'el-GR': 'Greek (Greece)',
  'id-ID': 'Indonesian (Indonesia)',
  'no-NO': 'Norwegian (Norway)',
  'sk-SK': 'Slovak (Slovakia)',
  'sv-SE': 'Swedish (Sweden)',
  'bg-BG': 'Bulgarian (Bulgaria)',
  'hu-HU': 'Hungarian (Hungary)',
  'ms-MY': 'Malay (Malaysia)',
  'ca-ES': 'Catalan (Spain)',
  'th-TH': 'Thai (Thailand)',
  'ar-SA': 'Arabic (Saudi Arabia)',
  'af-ZA': 'Afrikaans (South Africa)',
  'az-AZ': 'Azerbaijani (Azerbaijan)',
  'bs-BA': 'Bosnian (Bosnia and Herzegovina)',
  'cy-GB': 'Welsh (Wales)',
  'fa-IR': 'Persian (Iran)',
  'fil-PH': 'Filipino (Philippines)',
  'gl-ES': 'Galician (Spain)',
  'he-IL': 'Hebrew (Israel)',
  'hr-HR': 'Croatian (Croatia)',
  'hy-AM': 'Armenian (Armenia)',
  'is-IS': 'Icelandic (Iceland)',
  'kk-KZ': 'Kazakh (Kazakhstan)',
  'kn-IN': 'Kannada (India)',
  'mk-MK': 'Macedonian (North Macedonia)',
  'mr-IN': 'Marathi (India)',
  'ne-NP': 'Nepali (Nepal)',
  'sl-SI': 'Slovenian (Slovenia)',
  'sr-RS': 'Serbian (Serbia)',
  'sw-KE': 'Swahili (Kenya)',
  'ta-IN': 'Tamil (India)',
  'uk-UA': 'Ukrainian (Ukraine)',
  'ur-IN': 'Urdu (India)',
};

interface RetellVoice {
  voice_id: string;
  voice_name?: string;
  name?: string;
  provider?: string;
  gender?: string;
  language?: string;
  accent?: string;
  age?: string;
  preview_audio_url?: string;
  preview_url?: string;
  audio_url?: string;
  voice_type?: string;
}

interface ProcessedVoice {
  voice_id: string;
  voice_name: string;
  provider: string;
  gender: string;
  accent: string;
  age: string;
  preview_audio_url: string;
}

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.RETELL_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RETELL_API_KEY environment variable.');
    }

    console.log('Fetching live voice registry list from Retell API...');
    const response = await fetch('https://api.retellai.com/list-voices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Retell API error listing voices: ${response.status} - ${errorText}`);
    }

    const rawVoices = (await response.json()) as RetellVoice[];

    // 1. Process all voices globally (No English-only filter to support full multilingual catalogs)
    const processedVoices: ProcessedVoice[] = rawVoices.map((v: RetellVoice) => {
      const rawLocale = v.language || 'en-US';
      
      let displayLanguage = 'English (US)';
      if (localeDisplayNames[rawLocale]) {
        displayLanguage = localeDisplayNames[rawLocale];
      } else {
        displayLanguage = rawLocale.includes('-')
          ? rawLocale.split('-')[0].toUpperCase() + ' (' + rawLocale.split('-')[1].toUpperCase() + ')'
          : rawLocale.charAt(0).toUpperCase() + rawLocale.slice(1);
      }

      const isCustom = v.voice_type === 'custom' || v.voice_id.startsWith('custom_voice_');

      return {
        voice_id: v.voice_id,
        voice_name: v.voice_name || v.name || 'Unnamed Voice',
        provider: v.provider || 'retell',
        gender: isCustom ? 'Cloned' : (v.gender || 'Female'),
        accent: isCustom ? 'Custom' : displayLanguage,
        age: v.age || 'Middle Aged',
        preview_audio_url: v.preview_audio_url || v.preview_url || v.audio_url || '',
      };
    });

    const extractedLanguages = processedVoices.map((v: ProcessedVoice) => v.accent);
    // 2. Dynamic Language locales sorting alphabetically (Deduplicated and merged with comprehensive list to expose all 60+ global languages)
    const languages = Array.from(new Set([...extractedLanguages, ...Object.values(localeDisplayNames)])).sort();

    // 3. Expose LLM models
    const models = [
      { id: 'gpt-4o-mini', label: 'gpt-4o-mini (Recommended - Low Latency)' },
      { id: 'gpt-4o', label: 'gpt-4o (High Intelligence)' },
      { id: 'gpt-4', label: 'gpt-4 (High Precision Legacy)' },
      { id: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo (Fast Legacy)' },
      { id: 'claude-3-5-sonnet', label: 'claude-3-5-sonnet (Excellent Reasoning)' },
      { id: 'claude-3-opus', label: 'claude-3-opus (Complex Operations)' },
      { id: 'claude-3-haiku', label: 'claude-3-haiku (Extremely Fast)' },
      { id: 'gemini-1.5-pro', label: 'gemini-1.5-pro (Multimodal Logic)' },
      { id: 'gemini-1.5-flash', label: 'gemini-1.5-flash (Fast Multimodal)' },
    ];

    return NextResponse.json({
      success: true,
      voices: processedVoices,
      languages,
      models,
    });
  } catch (error) {
    console.error('GET live voices registry error:', error);
    
    const fallbackLanguages = Array.from(new Set(Object.values(localeDisplayNames))).sort();
    const fallbackModels = [
      { id: 'gpt-4o-mini', label: 'gpt-4o-mini (Recommended - Low Latency)' },
      { id: 'gpt-4o', label: 'gpt-4o (High Intelligence)' },
      { id: 'claude-3-5-sonnet', label: 'claude-3-5-sonnet (Excellent Reasoning)' },
    ];

    return NextResponse.json({
      success: false,
      voices: [],
      languages: fallbackLanguages,
      models: fallbackModels,
      error: error instanceof Error ? error.message : 'Failed to fetch config registry',
    });
  }
}
