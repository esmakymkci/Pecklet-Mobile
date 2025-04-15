import { Platform } from 'react-native';

const API_KEY = 'AIzaSyAAX9q61xKKkXe8_aYW4TGIQ9lAPgQM9YY';
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
  if (Platform.OS === 'web') {
    // Mock response for web to avoid CORS issues
    return mockTranslateResponse(word, targetLanguage);
  }

  try {
    const prompt = `
      Translate the word "${word}" from ${sourceLanguage} to ${targetLanguage}.
      Return a JSON object with the following structure:
      {
        "translation": "translated word",
        "pronunciation": "pronunciation guide if applicable",
        "examples": ["3 example sentences using the word in ${targetLanguage}", "with translations in ${sourceLanguage}"],
        "context": "brief context or usage notes"
      }
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
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error translating word');
    }

    const content = data.candidates[0].content.parts[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Translation error:', error);
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

  try {
    let prompt = '';
    
    if (isGeneric) {
      // Generate a generic quiz based on common vocabulary for the selected languages
      prompt = `
        Create a language learning quiz with common vocabulary words.
        Source language: ${sourceLanguage}, Target language: ${targetLanguage}.
        
        Generate 7 diverse question types:
        1. Multiple choice translation questions
        2. Fill in the blank sentences
        3. Word matching exercises
        4. True/False questions about word meanings
        5. Complete the sentence with the correct word
        6. Word order arrangement questions
        7. Context-based word selection questions
        
        Make sure to include a mix of questions testing both source to target language and target to source language.
        Use common, everyday vocabulary that would be useful for language learners.
        
        Return a JSON object with this structure:
        {
          "questions": [
            {
              "type": "multiple-choice",
              "question": "What is the [target language] translation of '[word in source language]'?",
              "options": ["correct answer", "wrong option 1", "wrong option 2", "wrong option 3"],
              "correctAnswer": "correct answer"
            },
            {
              "type": "fill-blank",
              "question": "Complete the sentence: '[sentence with blank for missing word]'",
              "correctAnswer": "word that goes in blank"
            },
            {
              "type": "matching",
              "question": "Match the words with their translations",
              "options": ["word1", "word2", "translation1", "translation2"],
              "correctAnswer": ["word1:translation1", "word2:translation2"]
            },
            {
              "type": "true-false",
              "question": "'[word in source]' means '[translation]' in [target language].",
              "correctAnswer": "true or false"
            },
            {
              "type": "sentence-completion",
              "question": "Choose the correct word to complete: '[sentence with _____ for missing word]'",
              "options": ["option1", "option2", "option3", "option4"],
              "correctAnswer": "correct option"
            },
            {
              "type": "word-order",
              "question": "Arrange the words to form a correct sentence: '[scrambled words]'",
              "options": ["word1", "word2", "word3", "word4"],
              "correctAnswer": ["word2", "word1", "word4", "word3"]
            },
            {
              "type": "context-selection",
              "question": "Which word would you use in this context: '[context description]'?",
              "options": ["option1", "option2", "option3", "option4"],
              "correctAnswer": "correct option"
            }
          ]
        }
      `;
    } else {
      // Generate a quiz based on the user's word list
      const wordsList = words.map(w => `${w.original} (${w.translation})`).join(', ');
      
      prompt = `
        Create a language learning quiz for these specific words: ${wordsList}.
        Source language: ${sourceLanguage}, Target language: ${targetLanguage}.
        
        Generate 7 diverse question types using ONLY the provided words:
        1. Multiple choice translation questions
        2. Fill in the blank sentences
        3. Word matching exercises
        4. True/False questions about word meanings
        5. Complete the sentence with the correct word
        6. Word order arrangement questions
        7. Context-based word selection questions
        
        Make sure to include a mix of questions testing both source to target language and target to source language.
        IMPORTANT: Only use the words provided in the list. Do not introduce new vocabulary.
        
        Return a JSON object with this structure:
        {
          "questions": [
            {
              "type": "multiple-choice",
              "question": "What is the [target language] translation of '[word in source language]'?",
              "options": ["correct answer", "wrong option 1", "wrong option 2", "wrong option 3"],
              "correctAnswer": "correct answer"
            },
            {
              "type": "fill-blank",
              "question": "Complete the sentence: '[sentence with blank for missing word]'",
              "correctAnswer": "word that goes in blank"
            },
            {
              "type": "matching",
              "question": "Match the words with their translations",
              "options": ["word1", "word2", "translation1", "translation2"],
              "correctAnswer": ["word1:translation1", "word2:translation2"]
            },
            {
              "type": "true-false",
              "question": "'[word in source]' means '[translation]' in [target language].",
              "correctAnswer": "true or false"
            },
            {
              "type": "sentence-completion",
              "question": "Choose the correct word to complete: '[sentence with _____ for missing word]'",
              "options": ["option1", "option2", "option3", "option4"],
              "correctAnswer": "correct option"
            },
            {
              "type": "word-order",
              "question": "Arrange the words to form a correct sentence: '[scrambled words]'",
              "options": ["word1", "word2", "word3", "word4"],
              "correctAnswer": ["word2", "word1", "word4", "word3"]
            },
            {
              "type": "context-selection",
              "question": "Which word would you use in this context: '[context description]'?",
              "options": ["option1", "option2", "option3", "option4"],
              "correctAnswer": "correct option"
            }
          ]
        }
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
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API error:', data.error);
      throw new Error(data.error.message || 'Error generating quiz');
    }

    const content = data.candidates[0].content.parts[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        return parsedData;
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Content:', content);
        throw new Error('Invalid JSON format in response');
      }
    } else {
      console.error('No JSON match found in:', content);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
    return mockQuizResponse(words, sourceLanguage, targetLanguage, isGeneric);
  }
};

export const generateLearningContent = async (
  level: number,
  sourceLanguage: string,
  targetLanguage: string
): Promise<GeminiLearningResponse> => {
  if (Platform.OS === 'web') {
    return mockLearningResponse(level, targetLanguage);
  }

  try {
    let topic = 'basic greetings and introductions';
    
    if (level === 2) topic = 'common phrases and questions';
    else if (level === 3) topic = 'food and dining';
    else if (level === 4) topic = 'travel and directions';
    else if (level === 5) topic = 'daily activities and routines';
    
    const prompt = `
      Generate 10 ${targetLanguage} vocabulary words for level ${level} language learners.
      Topic: ${topic}
      Source language: ${sourceLanguage}
      
      Return a JSON object with this structure:
      {
        "words": [
          {
            "original": "word in ${sourceLanguage}",
            "translation": "word in ${targetLanguage}",
            "pronunciation": "pronunciation guide if applicable",
            "examples": ["example sentence in ${targetLanguage}", "translation in ${sourceLanguage}"]
          },
          ...9 more words
        ]
      }
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
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error generating learning content');
    }

    const content = data.candidates[0].content.parts[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Learning content generation error:', error);
    return mockLearningResponse(level, targetLanguage);
  }
};

// Mock responses for development and web platform
const mockTranslateResponse = (word: string, targetLanguage: string): GeminiTranslationResponse => {
  const mockResponses: Record<string, GeminiTranslationResponse> = {
    hello: {
      translation: targetLanguage === 'es' ? 'hola' : 'bonjour',
      pronunciation: targetLanguage === 'es' ? 'OH-lah' : 'bohn-ZHOOR',
      examples: [
        targetLanguage === 'es' ? '¡Hola! ¿Cómo estás?' : 'Bonjour! Comment ça va?',
        targetLanguage === 'es' ? 'Hola a todos.' : 'Bonjour à tous.',
        targetLanguage === 'es' ? 'María dijo hola.' : 'Marie a dit bonjour.',
      ],
      context: targetLanguage === 'es' ? 'Saludo informal' : 'Salutation informelle',
    },
    goodbye: {
      translation: targetLanguage === 'es' ? 'adiós' : 'au revoir',
      pronunciation: targetLanguage === 'es' ? 'ah-DYOHS' : 'oh ruh-VWAHR',
      examples: [
        targetLanguage === 'es' ? 'Adiós, hasta mañana.' : 'Au revoir, à demain.',
        targetLanguage === 'es' ? 'Ella dijo adiós.' : 'Elle a dit au revoir.',
        targetLanguage === 'es' ? 'Es difícil decir adiós.' : "C'est difficile de dire au revoir.",
      ],
      context: targetLanguage === 'es' ? 'Despedida común' : 'Salutation de départ commune',
    },
  };

  return mockResponses[word.toLowerCase()] || {
    translation: targetLanguage === 'es' ? word + ' (es)' : word + ' (fr)',
    pronunciation: 'mock pronunciation',
    examples: [
      'Example sentence 1',
      'Example sentence 2',
      'Example sentence 3',
    ],
    context: 'Mock context for ' + word,
  };
};

const mockQuizResponse = (
  words: { original: string; translation: string }[],
  sourceLanguage: string,
  targetLanguage: string,
  isGeneric: boolean = false
): GeminiQuizResponse => {
  // If we have words, use them for the quiz
  if (words.length > 0 && !isGeneric) {
    return {
      questions: [
        {
          type: 'multiple-choice',
          question: `What is the ${targetLanguage} translation of "${words[0]?.original || 'hello'}"?`,
          options: [
            words[0]?.translation || 'hola',
            'incorrect1',
            'incorrect2',
            'incorrect3',
          ],
          correctAnswer: words[0]?.translation || 'hola',
        },
        {
          type: 'fill-blank',
          question: `Complete the sentence: "I want to say _____ to my friend."`,
          correctAnswer: words[0]?.original || 'hello',
        },
        {
          type: 'matching',
          question: 'Match the words with their translations',
          options: words.map(w => w.original).concat(words.map(w => w.translation)),
          correctAnswer: words.map((w, i) => `${i}:${i + words.length}`),
        },
        {
          type: 'true-false',
          question: `"${words[1]?.original || 'goodbye'}" means "${words[1]?.translation || 'adiós'}" in ${targetLanguage}.`,
          correctAnswer: 'true',
        },
        {
          type: 'sentence-completion',
          question: `Choose the correct word to complete: "I need to _____ my homework tonight."`,
          options: [
            words[0]?.original || 'do',
            'make',
            'create',
            'finish'
          ],
          correctAnswer: words[0]?.original || 'do',
        },
        {
          type: 'word-order',
          question: `Arrange the words to form a correct sentence: "to the store going I am"`,
          options: [
            'to',
            'the',
            'store',
            'going',
            'I',
            'am'
          ],
          correctAnswer: ['I', 'am', 'going', 'to', 'the', 'store'],
        },
        {
          type: 'context-selection',
          question: `Which word would you use when talking about ${words[0]?.original || 'greeting'} someone?`,
          options: [
            words[0]?.original || 'Hello',
            words[1]?.original || 'Goodbye',
            'Sorry',
            'Thanks',
          ],
          correctAnswer: words[0]?.original || 'Hello',
        },
      ],
    };
  } else {
    // Generic quiz with common vocabulary
    return {
      questions: [
        {
          type: 'multiple-choice',
          question: `What is the ${targetLanguage} translation of "hello"?`,
          options: [
            targetLanguage === 'es' ? 'hola' : 'bonjour',
            targetLanguage === 'es' ? 'adiós' : 'au revoir',
            targetLanguage === 'es' ? 'gracias' : 'merci',
            targetLanguage === 'es' ? 'por favor' : 's\'il vous plaît',
          ],
          correctAnswer: targetLanguage === 'es' ? 'hola' : 'bonjour',
        },
        {
          type: 'fill-blank',
          question: `Complete the sentence: "_____ is how we greet people."`,
          correctAnswer: 'Hello',
        },
        {
          type: 'matching',
          question: 'Match the words with their translations',
          options: [
            'hello', 
            'goodbye', 
            'thank you', 
            'please',
            targetLanguage === 'es' ? 'hola' : 'bonjour',
            targetLanguage === 'es' ? 'adiós' : 'au revoir',
            targetLanguage === 'es' ? 'gracias' : 'merci',
            targetLanguage === 'es' ? 'por favor' : 's\'il vous plaît',
          ],
          correctAnswer: ['0:4', '1:5', '2:6', '3:7'],
        },
        {
          type: 'true-false',
          question: `"Hello" means "${targetLanguage === 'es' ? 'hola' : 'bonjour'}" in ${targetLanguage}.`,
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
          type: 'word-order',
          question: `Arrange the words to form a correct sentence: "you how are today"`,
          options: [
            'you',
            'how',
            'are',
            'today'
          ],
          correctAnswer: ['how', 'are', 'you', 'today'],
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

const mockLearningResponse = (level: number, targetLanguage: string): GeminiLearningResponse => {
  const spanishWords = [
    {
      original: 'hello',
      translation: 'hola',
      pronunciation: 'OH-lah',
      examples: ['¡Hola! ¿Cómo estás?', 'Hello! How are you?'],
    },
    {
      original: 'goodbye',
      translation: 'adiós',
      pronunciation: 'ah-DYOHS',
      examples: ['Adiós, hasta mañana.', 'Goodbye, see you tomorrow.'],
    },
    {
      original: 'please',
      translation: 'por favor',
      pronunciation: 'pohr fah-VOHR',
      examples: ['Por favor, ayúdame.', 'Please help me.'],
    },
    {
      original: 'thank you',
      translation: 'gracias',
      pronunciation: 'GRAH-syahs',
      examples: ['Muchas gracias por tu ayuda.', 'Thank you very much for your help.'],
    },
    {
      original: 'yes',
      translation: 'sí',
      pronunciation: 'SEE',
      examples: ['Sí, estoy de acuerdo.', 'Yes, I agree.'],
    },
    {
      original: 'no',
      translation: 'no',
      pronunciation: 'noh',
      examples: ['No, no quiero ir.', 'No, I don\'t want to go.'],
    },
    {
      original: 'excuse me',
      translation: 'disculpe',
      pronunciation: 'dees-KOOL-peh',
      examples: ['Disculpe, ¿dónde está el baño?', 'Excuse me, where is the bathroom?'],
    },
    {
      original: 'sorry',
      translation: 'lo siento',
      pronunciation: 'loh SYEHN-toh',
      examples: ['Lo siento, fue mi culpa.', 'I\'m sorry, it was my fault.'],
    },
    {
      original: 'good morning',
      translation: 'buenos días',
      pronunciation: 'BWEH-nohs DEE-ahs',
      examples: ['¡Buenos días! ¿Cómo amaneciste?', 'Good morning! How did you wake up?'],
    },
    {
      original: 'good night',
      translation: 'buenas noches',
      pronunciation: 'BWEH-nahs NOH-chehs',
      examples: ['Buenas noches, que duermas bien.', 'Good night, sleep well.'],
    },
  ];

  const frenchWords = [
    {
      original: 'hello',
      translation: 'bonjour',
      pronunciation: 'bohn-ZHOOR',
      examples: ['Bonjour, comment ça va?', 'Hello, how are you?'],
    },
    {
      original: 'goodbye',
      translation: 'au revoir',
      pronunciation: 'oh ruh-VWAHR',
      examples: ['Au revoir, à demain.', 'Goodbye, see you tomorrow.'],
    },
    {
      original: 'please',
      translation: 's\'il vous plaît',
      pronunciation: 'seel voo PLEH',
      examples: ['S\'il vous plaît, aidez-moi.', 'Please help me.'],
    },
    {
      original: 'thank you',
      translation: 'merci',
      pronunciation: 'mehr-SEE',
      examples: ['Merci beaucoup pour votre aide.', 'Thank you very much for your help.'],
    },
    {
      original: 'yes',
      translation: 'oui',
      pronunciation: 'WEE',
      examples: ['Oui, je suis d\'accord.', 'Yes, I agree.'],
    },
    {
      original: 'no',
      translation: 'non',
      pronunciation: 'nohn',
      examples: ['Non, je ne veux pas y aller.', 'No, I don\'t want to go there.'],
    },
    {
      original: 'excuse me',
      translation: 'excusez-moi',
      pronunciation: 'ehk-skew-ZAY mwah',
      examples: ['Excusez-moi, où sont les toilettes?', 'Excuse me, where is the bathroom?'],
    },
    {
      original: 'sorry',
      translation: 'désolé',
      pronunciation: 'day-zoh-LAY',
      examples: ['Je suis désolé, c\'était ma faute.', 'I\'m sorry, it was my fault.'],
    },
    {
      original: 'good morning',
      translation: 'bonjour',
      pronunciation: 'bohn-ZHOOR',
      examples: ['Bonjour! Avez-vous bien dormi?', 'Good morning! Did you sleep well?'],
    },
    {
      original: 'good night',
      translation: 'bonne nuit',
      pronunciation: 'bun NWEE',
      examples: ['Bonne nuit, dormez bien.', 'Good night, sleep well.'],
    },
  ];

  return {
    words: targetLanguage === 'es' ? spanishWords : frenchWords,
  };
};