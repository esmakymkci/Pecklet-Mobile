import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiTranslationResponse {
  translation: string;
  pronunciation?: string;
  examples: string[];
  context?: string;
}

export interface GeminiQuizResponse {
  questions: {
    type: string;
    question: string;
    options?: string[];
    correctAnswer: string | string[];
  }[];
}

export interface GeminiLearningResponse {
  words: {
    original: string;
    translation: string;
    pronunciation?: string;
    examples: string[];
  }[];
}

export const translateWord = async (
  word: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<GeminiTranslationResponse> => {
  // Check if API key is available
  if (!API_KEY) {
    console.warn('Gemini API key not found, using mock response');
    return mockTranslateResponse(word, targetLanguage);
  }

  try {
    const prompt = `
      Translate the word "${word}" from ${sourceLanguage} to ${targetLanguage}.
      Provide a comprehensive response with pronunciation and examples.

      Return ONLY a valid JSON object with this exact structure:
      {
        "translation": "the translated word or phrase",
        "pronunciation": "phonetic pronunciation guide",
        "examples": [
          "Example sentence 1 in ${targetLanguage}",
          "Example sentence 2 in ${targetLanguage}",
          "Example sentence 3 in ${targetLanguage}"
        ],
        "context": "brief usage context or notes"
      }

      Make sure the JSON is valid and properly formatted.
    `;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1024,
      },
    };

    console.log('Making translation request for:', word);

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API error:', data.error);
      throw new Error(data.error.message || 'Error translating word');
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response:', content);

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        console.log('Parsed translation result:', result);
        return result;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse response JSON');
      }
    } else {
      console.error('No JSON found in response:', content);
      throw new Error('Invalid response format - no JSON found');
    }
  } catch (error) {
    console.error('Translation error:', error);
    // Return mock response as fallback
    return mockTranslateResponse(word, targetLanguage);
  }
};

export const generateQuiz = async (
  words: { original: string; translation: string }[],
  sourceLanguage: string,
  targetLanguage: string,
  isGeneric: boolean = false
): Promise<GeminiQuizResponse> => {
  if (Platform.OS === 'web') {
    return mockQuizResponse(words, sourceLanguage, targetLanguage, isGeneric);
  }

  // Check if API key is available
  if (!API_KEY) {
    console.warn('Gemini API key not found, using mock response');
    return mockQuizResponse(words, sourceLanguage, targetLanguage, isGeneric);
  }

  try {
    let prompt = '';

    if (isGeneric) {
      // Generate a generic quiz based on common vocabulary for the selected languages
      prompt = `
        Create a meaningful language learning quiz with common vocabulary words.
        Source language: ${sourceLanguage}, Target language: ${targetLanguage}.

        Generate exactly 7 diverse and meaningful questions:

        IMPORTANT REQUIREMENTS:
        1. Include BOTH source→target AND target→source translation questions
        2. Use realistic, practical vocabulary that language learners would encounter
        3. Create contextual sentences that make sense
        4. Ensure wrong options are plausible but clearly incorrect
        5. Make questions progressively challenging

        Question types to include:
        - 2-3 Multiple choice translation questions (mix of both directions)
        - 1-2 Fill in the blank with contextual sentences
        - 1 True/False about word meanings
        - 1 Sentence completion with realistic context
        - 1 Context-based word selection

        Return ONLY a valid JSON object with this exact structure:
        {
          "questions": [
            {
              "type": "multiple-choice",
              "question": "What is the ${targetLanguage} translation of '[common word in ${sourceLanguage}]'?",
              "options": ["correct answer", "plausible wrong 1", "plausible wrong 2", "plausible wrong 3"],
              "correctAnswer": "correct answer"
            },
            {
              "type": "multiple-choice",
              "question": "What does '[common word in ${targetLanguage}]' mean in ${sourceLanguage}?",
              "options": ["correct answer", "plausible wrong 1", "plausible wrong 2", "plausible wrong 3"],
              "correctAnswer": "correct answer"
            },
            {
              "type": "fill-blank",
              "question": "Complete the sentence: '[realistic sentence with _____ for missing word]'",
              "correctAnswer": "word that fits naturally"
            },
            {
              "type": "true-false",
              "question": "'[word in ${sourceLanguage}]' means '[correct or incorrect translation]' in ${targetLanguage}.",
              "correctAnswer": "true or false"
            },
            {
              "type": "sentence-completion",
              "question": "Choose the correct word to complete: '[realistic sentence with _____ for missing word]'",
              "options": ["correct option", "wrong option 1", "wrong option 2", "wrong option 3"],
              "correctAnswer": "correct option"
            },
            {
              "type": "context-selection",
              "question": "Which word would you use in this context: '[realistic scenario description]'?",
              "options": ["correct option", "wrong option 1", "wrong option 2", "wrong option 3"],
              "correctAnswer": "correct option"
            },
            {
              "type": "fill-blank",
              "question": "Complete the sentence: '[another realistic sentence with _____ for missing word]'",
              "correctAnswer": "word that fits naturally"
            }
          ]
        }

        Make sure the JSON is valid and properly formatted. Use common, everyday vocabulary.
      `;
    } else {
      // Generate a quiz based on the user's word list
      const wordsList = words.map(w => `${w.original} (${w.translation})`).join(', ');

      prompt = `
        Create a meaningful language learning quiz for these specific words: ${wordsList}.
        Source language: ${sourceLanguage}, Target language: ${targetLanguage}.

        Generate exactly 7 diverse and meaningful questions using ONLY the provided words:

        IMPORTANT REQUIREMENTS:
        1. Include BOTH ${sourceLanguage}→${targetLanguage} AND ${targetLanguage}→${sourceLanguage} translation questions
        2. Use ONLY the words provided in the list - do not introduce new vocabulary
        3. Create realistic, contextual sentences using these words
        4. For wrong options, use other words from the provided list
        5. Make questions test real understanding, not just memorization

        Question types to include:
        - 3-4 Multiple choice translation questions (mix of both directions)
        - 1-2 Fill in the blank with sentences using the words
        - 1 True/False about word meanings from the list
        - 1 Context-based selection using the words

        Return ONLY a valid JSON object with this exact structure:
        {
          "questions": [
            {
              "type": "multiple-choice",
              "question": "What is the ${targetLanguage} translation of '[word from list]'?",
              "options": ["correct translation", "wrong option from list", "wrong option from list", "wrong option from list"],
              "correctAnswer": "correct translation"
            },
            {
              "type": "multiple-choice",
              "question": "What does '[word from list in ${targetLanguage}]' mean in ${sourceLanguage}?",
              "options": ["correct answer", "wrong option from list", "wrong option from list", "wrong option from list"],
              "correctAnswer": "correct answer"
            },
            {
              "type": "fill-blank",
              "question": "Complete the sentence: '[realistic sentence using context of the word with _____ for missing word]'",
              "correctAnswer": "word from the list that fits"
            },
            {
              "type": "true-false",
              "question": "'[word from list]' means '[correct or incorrect translation from list]' in ${targetLanguage}.",
              "correctAnswer": "true or false"
            },
            {
              "type": "multiple-choice",
              "question": "What is the ${sourceLanguage} translation of '[word from list in ${targetLanguage}]'?",
              "options": ["correct answer", "wrong option from list", "wrong option from list", "wrong option from list"],
              "correctAnswer": "correct answer"
            },
            {
              "type": "context-selection",
              "question": "Which word from your list would you use in this context: '[realistic scenario using one of the words]'?",
              "options": ["correct word from list", "wrong word from list", "wrong word from list", "wrong word from list"],
              "correctAnswer": "correct word from list"
            },
            {
              "type": "multiple-choice",
              "question": "What is the ${targetLanguage} translation of '[another word from list]'?",
              "options": ["correct translation", "wrong option from list", "wrong option from list", "wrong option from list"],
              "correctAnswer": "correct translation"
            }
          ]
        }

        Make sure the JSON is valid and properly formatted. Only use the provided words.
      `;
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API error:', data.error);
      throw new Error(data.error.message || 'Error generating quiz');
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini quiz response:', content);

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('Parsed quiz data:', parsedData);

        // Validate the response structure
        if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
          throw new Error('Invalid quiz structure - missing questions array');
        }

        return parsedData;
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Content:', content);
        throw new Error('Invalid JSON format in response');
      }
    } else {
      console.error('No JSON match found in:', content);
      throw new Error('Invalid response format - no JSON found');
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
    // Return mock response as fallback
    return mockQuizResponse(words, sourceLanguage, targetLanguage, isGeneric);
  }
};

export const generateLearningContent = async (
  level: number,
  sourceLanguage: string,
  targetLanguage: string
): Promise<GeminiLearningResponse> => {
  if (Platform.OS === 'web') {
    return mockLearningResponse(level, sourceLanguage, targetLanguage);
  }

  // Check if API key is available
  if (!API_KEY) {
    console.warn('Gemini API key not found, using mock response');
    return mockLearningResponse(level, sourceLanguage, targetLanguage);
  }

  try {
    let topic = 'basic greetings and introductions';
    let description = 'Essential words for meeting people and basic communication';

    if (level === 2) {
      topic = 'common phrases and questions';
      description = 'Useful phrases for everyday conversations and asking questions';
    } else if (level === 3) {
      topic = 'food and dining';
      description = 'Vocabulary for restaurants, meals, and food-related conversations';
    } else if (level === 4) {
      topic = 'travel and directions';
      description = 'Essential words for traveling, asking for directions, and transportation';
    } else if (level === 5) {
      topic = 'daily activities and routines';
      description = 'Words for describing daily life, work, and personal routines';
    }

    const prompt = `
      Generate 10 practical vocabulary words for level ${level} language learners.
      Topic: ${topic}
      Description: ${description}

      LEARNING CONTEXT:
      - The learner speaks: ${sourceLanguage}
      - The learner wants to learn: ${targetLanguage}
      - Generate words that a ${sourceLanguage} speaker would want to learn in ${targetLanguage}

      IMPORTANT REQUIREMENTS:
      1. "original" field should contain the word in ${sourceLanguage} (what the learner already knows)
      2. "translation" field should contain the word in ${targetLanguage} (what the learner wants to learn)
      3. Include proper pronunciation guides for the ${targetLanguage} words
      4. Provide realistic example sentences in ${targetLanguage} that demonstrate usage
      5. Make sure examples are appropriate for the learner's level
      6. Focus on high-frequency, practical vocabulary for the topic "${topic}"

      Return ONLY a valid JSON object with this exact structure:
      {
        "words": [
          {
            "original": "word in ${sourceLanguage} (learner's native language)",
            "translation": "corresponding word in ${targetLanguage} (target language)",
            "pronunciation": "pronunciation guide for the ${targetLanguage} word",
            "examples": [
              "Example sentence in ${targetLanguage} using the target word",
              "Another example sentence in ${targetLanguage} showing different usage"
            ]
          },
          ...9 more words following the same pattern
        ]
      }

      Make sure:
      - All words are relevant to "${topic}"
      - "original" is always in ${sourceLanguage}, "translation" is always in ${targetLanguage}
      - Pronunciation guides are accurate for ${targetLanguage}
      - Examples are in ${targetLanguage} and demonstrate real usage
      - JSON is valid and properly formatted
      - Words progress from basic to slightly more advanced within the level
    `;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('Gemini API error:', data.error);
      throw new Error(data.error.message || 'Error generating learning content');
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini learning response:', content);

    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('Parsed learning data:', parsedData);

        // Validate the response structure
        if (!parsedData.words || !Array.isArray(parsedData.words)) {
          throw new Error('Invalid learning content structure - missing words array');
        }

        return parsedData;
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Content:', content);
        throw new Error('Invalid JSON format in response');
      }
    } else {
      console.error('No JSON match found in:', content);
      throw new Error('Invalid response format - no JSON found');
    }
  } catch (error) {
    console.error('Learning content generation error:', error);
    // Return mock response as fallback
    return mockLearningResponse(level, sourceLanguage, targetLanguage);
  }
};

// Mock responses for development and fallback
const mockTranslateResponse = (word: string, targetLanguage: string): GeminiTranslationResponse => {
  const lowerWord = word.toLowerCase();

  // Common word translations
  const commonTranslations: Record<string, Record<string, GeminiTranslationResponse>> = {
    hello: {
      es: {
        translation: 'hola',
        pronunciation: 'OH-lah',
        examples: [
          '¡Hola! ¿Cómo estás?',
          'Hola a todos en la reunión.',
          'María siempre dice hola con una sonrisa.',
        ],
        context: 'Saludo informal común',
      },
      fr: {
        translation: 'bonjour',
        pronunciation: 'bohn-ZHOOR',
        examples: [
          'Bonjour! Comment ça va?',
          'Bonjour à tous dans la salle.',
          'Marie dit toujours bonjour avec le sourire.',
        ],
        context: 'Salutation informelle commune',
      },
    },
    goodbye: {
      es: {
        translation: 'adiós',
        pronunciation: 'ah-DYOHS',
        examples: [
          'Adiós, hasta mañana.',
          'Ella dijo adiós y se fue.',
          'Es difícil decir adiós a los amigos.',
        ],
        context: 'Despedida común',
      },
      fr: {
        translation: 'au revoir',
        pronunciation: 'oh ruh-VWAHR',
        examples: [
          'Au revoir, à demain.',
          'Elle a dit au revoir et est partie.',
          "C'est difficile de dire au revoir aux amis.",
        ],
        context: 'Salutation de départ commune',
      },
    },
    thank: {
      es: {
        translation: 'gracias',
        pronunciation: 'GRAH-syahs',
        examples: [
          'Gracias por tu ayuda.',
          'Muchas gracias por venir.',
          'Le dijo gracias al profesor.',
        ],
        context: 'Expresión de gratitud',
      },
      fr: {
        translation: 'merci',
        pronunciation: 'mer-SEE',
        examples: [
          'Merci pour votre aide.',
          'Merci beaucoup de venir.',
          'Il a dit merci au professeur.',
        ],
        context: 'Expression de gratitude',
      },
    },
    please: {
      es: {
        translation: 'por favor',
        pronunciation: 'pohr fah-VOHR',
        examples: [
          'Por favor, ayúdame.',
          'Ven aquí, por favor.',
          'Por favor, no hagas ruido.',
        ],
        context: 'Expresión de cortesía',
      },
      fr: {
        translation: 's\'il vous plaît',
        pronunciation: 'seel voo PLEH',
        examples: [
          'S\'il vous plaît, aidez-moi.',
          'Venez ici, s\'il vous plaît.',
          'S\'il vous plaît, ne faites pas de bruit.',
        ],
        context: 'Expression de politesse',
      },
    },
  };

  // Check if we have a specific translation for this word
  if (commonTranslations[lowerWord] && commonTranslations[lowerWord][targetLanguage]) {
    return commonTranslations[lowerWord][targetLanguage];
  }

  // Generic fallback response
  const genericTranslations = {
    es: {
      translation: `${word} (traducción española)`,
      pronunciation: `pronunciación de ${word}`,
      examples: [
        `Ejemplo 1 con ${word} en español.`,
        `Ejemplo 2 usando ${word} en contexto.`,
        `Ejemplo 3 mostrando ${word} en una oración.`,
      ],
      context: `Contexto de uso para ${word}`,
    },
    fr: {
      translation: `${word} (traduction française)`,
      pronunciation: `prononciation de ${word}`,
      examples: [
        `Exemple 1 avec ${word} en français.`,
        `Exemple 2 utilisant ${word} en contexte.`,
        `Exemple 3 montrant ${word} dans une phrase.`,
      ],
      context: `Contexte d'usage pour ${word}`,
    },
  };

  return genericTranslations[targetLanguage as keyof typeof genericTranslations] || {
    translation: `${word} (translation)`,
    pronunciation: `pronunciation of ${word}`,
    examples: [
      `Example 1 with ${word}.`,
      `Example 2 using ${word} in context.`,
      `Example 3 showing ${word} in a sentence.`,
    ],
    context: `Usage context for ${word}`,
  };
};

const mockQuizResponse = (
  words: { original: string; translation: string }[],
  sourceLanguage: string,
  targetLanguage: string,
  isGeneric: boolean = false
): GeminiQuizResponse => {
  console.log('Mock Quiz Response - Words:', words);
  console.log('Mock Quiz Response - Source:', sourceLanguage, 'Target:', targetLanguage);

  // If we have words, use them for the quiz
  if (words.length > 0 && !isGeneric) {
    // Ensure we have enough words for variety
    const availableWords = words.length >= 4 ? words.slice(0, 4) : [...words];

    // If we don't have enough words, duplicate some to fill options
    while (availableWords.length < 4) {
      availableWords.push(...words.slice(0, 4 - availableWords.length));
    }

    const questions = [];

    // Generate questions using the actual words from the list
    availableWords.forEach((word, index) => {
      if (index < 3) { // Generate 3 source→target questions
        const incorrectOptions = availableWords
          .filter(w => w.translation !== word.translation)
          .map(w => w.translation)
          .slice(0, 3);

        // Fill with generic options if not enough
        while (incorrectOptions.length < 3) {
          incorrectOptions.push(`option${incorrectOptions.length + 1}`);
        }

        questions.push({
          type: 'multiple-choice',
          question: `What is the translation of "${word.original}" in ${targetLanguage}?`,
          options: [word.translation, ...incorrectOptions].sort(() => 0.5 - Math.random()),
          correctAnswer: word.translation,
        });
      }

      if (index < 2) { // Generate 2 target→source questions
        const incorrectOptions = availableWords
          .filter(w => w.original !== word.original)
          .map(w => w.original)
          .slice(0, 3);

        // Fill with generic options if not enough
        while (incorrectOptions.length < 3) {
          incorrectOptions.push(`option${incorrectOptions.length + 1}`);
        }

        questions.push({
          type: 'multiple-choice',
          question: `What does "${word.translation}" mean in ${sourceLanguage}?`,
          options: [word.original, ...incorrectOptions].sort(() => 0.5 - Math.random()),
          correctAnswer: word.original,
        });
      }
    });

    // Add a fill-blank question
    if (availableWords.length > 0) {
      questions.push({
        type: 'fill-blank',
        question: `Complete the sentence: "I need to remember the word _____ for my vocabulary test."`,
        correctAnswer: availableWords[0].original,
      });
    }

    // Add a true-false question
    if (availableWords.length > 1) {
      questions.push({
        type: 'true-false',
        question: `"${availableWords[1].original}" means "${availableWords[1].translation}" in ${targetLanguage}.`,
        correctAnswer: 'true',
      });
    }

    return {
      questions: questions.slice(0, 7), // Limit to 7 questions
    };
  } else {
    // Generic quiz with common vocabulary
    const getTranslation = (word: string) => {
      const translations: Record<string, Record<string, string>> = {
        'es': {
          'hello': 'hola',
          'goodbye': 'adiós',
          'thank you': 'gracias',
          'please': 'por favor',
          'yes': 'sí',
          'no': 'no',
          'excuse me': 'disculpe',
          'sorry': 'lo siento'
        },
        'fr': {
          'hello': 'bonjour',
          'goodbye': 'au revoir',
          'thank you': 'merci',
          'please': 's\'il vous plaît',
          'yes': 'oui',
          'no': 'non',
          'excuse me': 'excusez-moi',
          'sorry': 'désolé'
        }
      };
      return translations[targetLanguage]?.[word] || word;
    };

    return {
      questions: [
        {
          type: 'multiple-choice',
          question: `What is the ${targetLanguage} translation of "hello"?`,
          options: [
            getTranslation('hello'),
            getTranslation('goodbye'),
            getTranslation('thank you'),
            getTranslation('please'),
          ],
          correctAnswer: getTranslation('hello'),
        },
        {
          type: 'multiple-choice',
          question: `What does "${getTranslation('goodbye')}" mean in ${sourceLanguage}?`,
          options: [
            'goodbye',
            'hello',
            'thank you',
            'please',
          ],
          correctAnswer: 'goodbye',
        },
        {
          type: 'fill-blank',
          question: `Complete the sentence: "_____ is how we greet people when we meet them."`,
          correctAnswer: 'Hello',
        },
        {
          type: 'true-false',
          question: `"Thank you" means "${getTranslation('thank you')}" in ${targetLanguage}.`,
          correctAnswer: 'true',
        },
        {
          type: 'sentence-completion',
          question: `Choose the correct word to complete: "_____ you very much for your help."`,
          options: [
            'Thank',
            'Hello',
            'Please',
            'Sorry'
          ],
          correctAnswer: 'Thank',
        },
        {
          type: 'multiple-choice',
          question: `What is the ${sourceLanguage} translation of "${getTranslation('please')}"?`,
          options: [
            'please',
            'hello',
            'goodbye',
            'thank you',
          ],
          correctAnswer: 'please',
        },
        {
          type: 'context-selection',
          question: 'Which word would you use when meeting someone for the first time?',
          options: [
            'Hello',
            'Goodbye',
            'Sorry',
            'Thanks',
          ],
          correctAnswer: 'Hello',
        },
      ],
    };
  }
};

const mockLearningResponse = (_level: number, sourceLanguage: string, targetLanguage: string): GeminiLearningResponse => {
  console.log('Mock Learning Response - Source:', sourceLanguage, 'Target:', targetLanguage);

  // Create a comprehensive word database
  const wordDatabase: Record<string, Record<string, { word: string; pronunciation: string; examples: string[] }>> = {
    'en': { // English words
      'hello': { word: 'hello', pronunciation: 'heh-LOH', examples: ['Hello, how are you?', 'Hello everyone!'] },
      'goodbye': { word: 'goodbye', pronunciation: 'good-BYE', examples: ['Goodbye, see you later', 'Goodbye my friend'] },
      'thank you': { word: 'thank you', pronunciation: 'THANK yoo', examples: ['Thank you for your help', 'Thank you very much'] },
      'please': { word: 'please', pronunciation: 'pleez', examples: ['Please help me', 'Come here, please'] },
      'yes': { word: 'yes', pronunciation: 'yes', examples: ['Yes, I agree', 'Yes, of course'] },
      'no': { word: 'no', pronunciation: 'noh', examples: ['No, I cannot', 'No, I don\'t like it'] },
      'excuse me': { word: 'excuse me', pronunciation: 'ik-SKYOOZ mee', examples: ['Excuse me, where is the bathroom?', 'Excuse me for the interruption'] },
      'sorry': { word: 'sorry', pronunciation: 'SOR-ee', examples: ['I\'m very sorry', 'Sorry for being late'] },
      'water': { word: 'water', pronunciation: 'WAH-ter', examples: ['I need water', 'The water is cold'] },
      'food': { word: 'food', pronunciation: 'food', examples: ['The food is delicious', 'I need food'] }
    },
    'es': { // Spanish words
      'hello': { word: 'hola', pronunciation: 'OH-lah', examples: ['Hola, ¿cómo estás?', 'Hola amigo'] },
      'goodbye': { word: 'adiós', pronunciation: 'ah-DYOHS', examples: ['Adiós, hasta mañana', 'Adiós amigos'] },
      'thank you': { word: 'gracias', pronunciation: 'GRAH-syahs', examples: ['Muchas gracias por tu ayuda', 'Gracias por todo'] },
      'please': { word: 'por favor', pronunciation: 'pohr fah-VOHR', examples: ['Por favor, ayúdame', 'Ven aquí, por favor'] },
      'yes': { word: 'sí', pronunciation: 'SEE', examples: ['Sí, estoy de acuerdo', 'Sí, claro'] },
      'no': { word: 'no', pronunciation: 'noh', examples: ['No, no puedo', 'No me gusta'] },
      'excuse me': { word: 'disculpe', pronunciation: 'dees-KOOL-peh', examples: ['Disculpe, ¿dónde está el baño?', 'Disculpe la molestia'] },
      'sorry': { word: 'lo siento', pronunciation: 'loh SYEHN-toh', examples: ['Lo siento mucho', 'Lo siento por llegar tarde'] },
      'water': { word: 'agua', pronunciation: 'AH-gwah', examples: ['Necesito agua', 'El agua está fría'] },
      'food': { word: 'comida', pronunciation: 'koh-MEE-dah', examples: ['La comida está deliciosa', 'Necesito comida'] }
    },
    'fr': { // French words
      'hello': { word: 'bonjour', pronunciation: 'bohn-ZHOOR', examples: ['Bonjour, comment ça va?', 'Bonjour mon ami'] },
      'goodbye': { word: 'au revoir', pronunciation: 'oh ruh-VWAHR', examples: ['Au revoir, à demain', 'Au revoir mes amis'] },
      'thank you': { word: 'merci', pronunciation: 'mehr-SEE', examples: ['Merci beaucoup pour votre aide', 'Merci pour tout'] },
      'please': { word: 's\'il vous plaît', pronunciation: 'seel voo PLEH', examples: ['S\'il vous plaît, aidez-moi', 'Venez ici, s\'il vous plaît'] },
      'yes': { word: 'oui', pronunciation: 'WEE', examples: ['Oui, je suis d\'accord', 'Oui, bien sûr'] },
      'no': { word: 'non', pronunciation: 'nohn', examples: ['Non, je ne peux pas', 'Je n\'aime pas'] },
      'excuse me': { word: 'excusez-moi', pronunciation: 'ehk-skew-ZAY mwah', examples: ['Excusez-moi, où sont les toilettes?', 'Excusez-moi pour le dérangement'] },
      'sorry': { word: 'désolé', pronunciation: 'day-zoh-LAY', examples: ['Je suis très désolé', 'Désolé d\'être en retard'] },
      'water': { word: 'eau', pronunciation: 'oh', examples: ['J\'ai besoin d\'eau', 'L\'eau est froide'] },
      'food': { word: 'nourriture', pronunciation: 'noo-ree-TOOR', examples: ['La nourriture est délicieuse', 'J\'ai besoin de nourriture'] }
    },
    'tr': { // Turkish words
      'hello': { word: 'merhaba', pronunciation: 'mer-ha-BA', examples: ['Merhaba, nasılsın?', 'Merhaba arkadaşım'] },
      'goodbye': { word: 'hoşça kal', pronunciation: 'hosh-CHA kal', examples: ['Hoşça kal, yarın görüşürüz', 'Hoşça kal dostum'] },
      'thank you': { word: 'teşekkür ederim', pronunciation: 'te-shek-KOOR e-de-rim', examples: ['Yardımın için teşekkür ederim', 'Çok teşekkür ederim'] },
      'please': { word: 'lütfen', pronunciation: 'LUET-fen', examples: ['Lütfen bana yardım et', 'Buraya gel, lütfen'] },
      'yes': { word: 'evet', pronunciation: 'e-VET', examples: ['Evet, katılıyorum', 'Evet, tabii ki'] },
      'no': { word: 'hayır', pronunciation: 'ha-YIR', examples: ['Hayır, yapamam', 'Hayır, sevmiyorum'] },
      'excuse me': { word: 'affedersiniz', pronunciation: 'af-fe-der-si-NIZ', examples: ['Affedersiniz, tuvalet nerede?', 'Affedersiniz, rahatsızlık için'] },
      'sorry': { word: 'özür dilerim', pronunciation: 'oe-ZUER di-le-rim', examples: ['Çok özür dilerim', 'Geç kaldığım için özür dilerim'] },
      'water': { word: 'su', pronunciation: 'soo', examples: ['Suya ihtiyacım var', 'Su soğuk'] },
      'food': { word: 'yemek', pronunciation: 'ye-MEK', examples: ['Yemek çok lezzetli', 'Yemeğe ihtiyacım var'] }
    }
  };

  // Get source and target language data
  const sourceWords = wordDatabase[sourceLanguage] || wordDatabase['en'];
  const targetWords = wordDatabase[targetLanguage] || wordDatabase['es'];

  const baseWordKeys = ['hello', 'goodbye', 'thank you', 'please', 'yes', 'no', 'excuse me', 'sorry', 'water', 'food'];

  return {
    words: baseWordKeys.map(wordKey => {
      const sourceData = sourceWords[wordKey];
      const targetData = targetWords[wordKey];

      return {
        original: sourceData.word, // Word in source language (what user speaks)
        translation: targetData.word, // Word in target language (what user wants to learn)
        pronunciation: targetData.pronunciation, // Pronunciation for target language
        examples: targetData.examples // Examples in target language
      };
    })
  };
};