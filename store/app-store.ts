import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Word, WordList, Quiz, UserStats, UserSettings, LearningLevel, Story, Competition } from '@/types';

interface AppState {
  wordLists: WordList[];
  quizHistory: Quiz[];
  userStats: UserStats;
  userSettings: UserSettings;
  learningLevels: LearningLevel[];
  stories: Story[];
  competitions: Competition[];
  
  // Word List Actions
  addWordList: (list: Omit<WordList, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'totalWords'>) => void;
  updateWordList: (listId: string, updates: Partial<WordList>) => void;
  deleteWordList: (listId: string) => void;
  
  // Word Actions
  addWordToList: (listId: string, word: Omit<Word, 'id' | 'createdAt' | 'learned'>) => void;
  updateWord: (listId: string, wordId: string, updates: Partial<Word>) => void;
  deleteWord: (listId: string, wordId: string) => void;
  markWordAsLearned: (listId: string, wordId: string, learned: boolean) => void;
  
  // Quiz Actions
  saveQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt'>) => void;
  
  // User Stats Actions
  updateUserStats: (updates: Partial<UserStats>) => void;
  incrementStreak: () => void;
  
  // Settings Actions
  updateUserSettings: (updates: Partial<UserSettings>) => void;
  
  // Learning Levels
  unlockLevel: (levelId: number) => void;
  completeLevel: (levelId: number) => void;
  updateLevelProgress: (levelId: number, progress: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      wordLists: [],
      quizHistory: [],
      userStats: {
        listsCreated: 0,
        wordsAdded: 0,
        wordsLearned: 0,
        quizzesTaken: 0,
        averageScore: 0,
        streak: 0,
        lastActive: new Date(),
        totalXp: 0,
        level: 1,
      },
      userSettings: {
        theme: 'light',
        notifications: true,
        soundEffects: true,
        defaultSourceLanguage: 'en',
        defaultTargetLanguage: 'es',
        dailyGoal: 10,
      },
      learningLevels: [
        {
          id: 1,
          title: 'Basics',
          description: 'Learn essential vocabulary',
          wordCount: 10,
          isUnlocked: true,
          isCompleted: false,
          progress: 0,
        },
        {
          id: 2,
          title: 'Greetings',
          description: 'Common greetings and phrases',
          wordCount: 10,
          isUnlocked: false,
          isCompleted: false,
          progress: 0,
        },
        {
          id: 3,
          title: 'Food & Drinks',
          description: 'Vocabulary for restaurants and meals',
          wordCount: 15,
          isUnlocked: false,
          isCompleted: false,
          progress: 0,
        },
        {
          id: 4,
          title: 'Travel',
          description: 'Essential travel vocabulary',
          wordCount: 15,
          isUnlocked: false,
          isCompleted: false,
          progress: 0,
        },
        {
          id: 5,
          title: 'Daily Life',
          description: 'Words for everyday situations',
          wordCount: 20,
          isUnlocked: false,
          isCompleted: false,
          progress: 0,
        },
      ],
      stories: [
        {
          id: '1',
          title: 'Berlin Adventure',
          description: 'Explore the vibrant city of Berlin through the eyes of a first-time visitor. Learn vocabulary related to travel, city life, and cultural experiences.',
          content: 'Sarah arrived in Berlin on a sunny day in June. The city was bustling with activity as she stepped out of the train station. She had been studying German for six months and was excited to practice with native speakers.\n\nHer first stop was a small café near Alexanderplatz. "Ein Kaffee, bitte," she ordered, proud of her pronunciation. The barista smiled and replied in rapid German. Sarah understood most of it and felt a surge of confidence.\n\nAs she explored the city, she visited the Brandenburg Gate, the Berlin Wall Memorial, and several museums. Each place had its own unique story to tell about Germany\'s complex history.\n\nIn the evening, she met some local students at a biergarten. They were impressed by her German skills and taught her some slang expressions not found in textbooks. Sarah took notes on her phone, determined to remember everything.\n\nBy the end of her first day, Sarah had walked over 20,000 steps, taken dozens of photos, and learned at least 15 new German words. As she fell asleep in her hotel room, she couldn\'t wait to see what tomorrow would bring in this fascinating city.',
          imageUrl: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc',
          difficulty: 'beginner',
          language: 'en',
          duration: 5,
          isPremium: false,
        },
        {
          id: '2',
          title: 'Tokyo Nights',
          description: 'A journey through Tokyo after dark reveals the city\'s neon-lit streets, vibrant nightlife, and unique cultural experiences that come alive when the sun sets.',
          content: 'The neon lights of Tokyo flickered to life as the sun dipped below the horizon. Akira, an American exchange student, stood mesmerized by the transformation. By day, Tokyo was efficient and orderly, but by night, it became a kaleidoscope of colors and sounds.\n\nAkira had been in Japan for three months, but this was his first time exploring Shinjuku after dark. His Japanese language skills were improving, but he still struggled with the rapid-fire Tokyo dialect.\n\n"Sumimasen," he said to a street vendor, pointing at a savory-smelling snack. "Kore wa nan desu ka?" (Excuse me, what is this?)\n\nThe vendor smiled and explained it was takoyaki, a popular street food made with octopus. Akira decided to try it, carefully balancing the hot ball-shaped snacks as he continued his walk.\n\nHe passed through the famous Golden Gai, a network of narrow alleys filled with tiny bars, each seating only a handful of patrons. In one bar no larger than a closet, he met an elderly man who had been a jazz musician in the 1960s. Despite the language barrier, they connected over their shared love of Miles Davis.\n\nAs midnight approached, Akira found himself in a 24-hour bookstore, browsing manga to improve his reading skills. He selected a beginner-friendly series and headed back to his apartment, the city still pulsing with energy around him.\n\nTokyo at night had taught him more about Japanese culture than any textbook ever could. He fell asleep with new words and experiences swirling in his mind, already planning his next nighttime adventure.',
          imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
          difficulty: 'intermediate',
          language: 'en',
          duration: 8,
          isPremium: true,
        },
        {
          id: '3',
          title: 'Paris Morning',
          description: 'Experience the quiet charm of Paris in the early morning hours, when the city of lights is just waking up and revealing its most authentic self.',
          content: 'The smell of fresh bread filled the air as Marie stepped out of her apartment on Rue Cler. It was barely 7 AM, and Paris was just waking up. This was her favorite time of day, before the tourists emerged and the city belonged only to Parisians.\n\nShe had moved from Montreal six months ago to improve her French, which was already fluent but lacked the authentic Parisian accent. Each morning, she practiced by chatting with local shopkeepers.\n\n"Bonjour, Marie! Le pain habituel?" called out the baker as she entered his shop. (Good morning, Marie! The usual bread?)\n\n"Oui, s\'il vous plaît, et aussi un pain au chocolat," she replied, still finding joy in these simple daily exchanges.\n\nWith her baguette tucked under her arm, Marie walked to her favorite spot by the Seine. The early morning light cast a golden glow on the water and the ancient buildings. She opened her notebook and began writing, a daily exercise her language teacher had recommended.\n\nAn elderly man with a small dog sat nearby, and they exchanged pleasantries about the weather. He spoke slowly, noticing her slight accent, and Marie appreciated the kindness. These brief conversations with strangers had done more for her French than hours of formal study.\n\nAs the clock tower struck 8:30, Marie packed up her things. The city was coming alive now, with more people filling the streets and cafés opening their terraces. She had class at 9:00, where she would share her morning observations in increasingly confident French.\n\nThese quiet Paris mornings had become her most effective classroom.',
          imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
          difficulty: 'beginner',
          language: 'en',
          duration: 4,
          isPremium: false,
        },
        {
          id: '4',
          title: 'Barcelona Tapas Tour',
          description: 'Join a culinary adventure through Barcelona\'s vibrant tapas scene, learning Spanish food vocabulary while exploring the city\'s historic neighborhoods.',
          content: 'Carlos guided the small group through the narrow streets of Barcelona\'s Gothic Quarter. "Tonight, we\'ll learn Spanish through our stomachs," he announced with a grin. The five students, all at different levels in their Spanish studies, looked excited but nervous about the immersive experience ahead.\n\n"Our first stop is for \'pan con tomate,\'" Carlos explained, leading them into a tiny tavern. "This is one of the simplest but most beloved Catalan dishes."\n\nThe waiter brought out slices of toasted bread rubbed with garlic and ripe tomato, drizzled with olive oil and sprinkled with salt. As they ate, Carlos taught them vocabulary related to food preparation: tostar (to toast), untar (to spread), rociar (to drizzle).\n\nAt the next location, they tried various montaditos - small open sandwiches with different toppings. Each student had to order in Spanish, describing their preferences. Emma, who had only been studying for two months, successfully requested one without seafood: "Sin mariscos, por favor."\n\nAs the evening progressed, they visited five more establishments, sampling patatas bravas, gambas al ajillo, croquetas, and more. With each dish came new vocabulary, cultural context, and increasingly fluid Spanish conversation, helped along by small glasses of local wine.\n\nBy the final stop, a dessert place serving traditional crema catalana, even the beginners were attempting full sentences, asking questions about ingredients and preparation methods.\n\n"Food is the perfect teacher," Carlos said as they finished their sweet treats. "You remember words better when they\'re connected to flavors and experiences."\n\nThe students left with full stomachs, dozens of new Spanish words, and a deeper appreciation for Barcelona\'s culinary heritage.',
          imageUrl: 'https://images.unsplash.com/photo-1512753360435-329c4535a9a7',
          difficulty: 'intermediate',
          language: 'en',
          duration: 7,
          isPremium: true,
        },
        {
          id: '5',
          title: 'A Weekend in Rome',
          description: 'Follow two friends as they navigate Rome\'s historic sites and modern culture during a weekend trip, picking up essential Italian phrases along the way.',
          content: 'Lisa and Mark had exactly 48 hours in Rome. Armed with a phrasebook and the Italian language app they\'d been practicing with for weeks, they were determined to avoid speaking English as much as possible.\n\n"Buongiorno! Due caffè, per favore," Mark ordered at their first stop, a standing-room-only espresso bar near their hotel. The barista responded with a rapid stream of Italian, and Mark froze.\n\n"He\'s asking if we want sugar," Lisa whispered, proud of recognizing "zucchero" from their lessons.\n\nThey sipped their espressos Italian-style - quickly, while standing - and set off toward the Colosseum. On the way, they practiced asking for directions from locals, sometimes understanding the responses, sometimes just nodding and thanking people before consulting their map.\n\nAt the ancient amphitheater, they joined an Italian tour group instead of the English one, challenging themselves to follow along. They understood perhaps 40% of the guide\'s explanation, but the immersive experience felt more authentic.\n\nFor lunch, they ventured into a neighborhood trattoria with no English menu. Using their food vocabulary, they ordered pasta carbonara and cacio e pepe, along with house wine. The waiter, appreciating their efforts, taught them new culinary terms for ingredients and cooking methods.\n\nBy evening, when they tossed coins into the Trevi Fountain, they had collected dozens of useful phrases. Their pronunciation was improving with each interaction.\n\nOn Sunday morning, they visited a local market, where they practiced numbers and negotiation while buying souvenirs. An elderly vendor corrected Mark\'s pronunciation of "grazie mille" with a kind smile.\n\nAs they boarded their flight home, Lisa updated their language app: "Real-world practice: 10 hours. New words learned: 57. Confidence level: significantly improved."\n\n"Next time," Mark said, switching to his newly improved Italian, "forse parleremo solo italiano." (Maybe we\'ll speak only Italian.)',
          imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
          difficulty: 'beginner',
          language: 'en',
          duration: 6,
          isPremium: false,
        },
      ],
      competitions: [
        {
          id: '1',
          title: 'Breaking Bad Vocabulary',
          description: 'Test your knowledge of terms, characters, and iconic moments from the hit TV show Breaking Bad. This competition will challenge your understanding of the show\'s unique language and memorable quotes.',
          imageUrl: 'https://images.unsplash.com/photo-1602542165259-9f78d0768c12',
          category: 'TV Shows',
          participants: 256,
          duration: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          wordCount: 20,
          isActive: true,
        },
        {
          id: '2',
          title: 'Lord of the Rings',
          description: 'Journey through Middle Earth with this vocabulary challenge based on J.R.R. Tolkien\'s epic fantasy world. From Hobbiton to Mordor, test your knowledge of characters, places, and magical elements.',
          imageUrl: 'https://images.unsplash.com/photo-1506466010722-395aa2bef877',
          category: 'Movies',
          participants: 189,
          duration: 15,
          startDate: new Date(),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          wordCount: 25,
          isActive: true,
        },
        {
          id: '3',
          title: 'Stranger Things',
          description: 'Enter the Upside Down with this competition focused on the vocabulary and terminology from Hawkins, Indiana. Test your knowledge of the supernatural phenomena, 80s references, and character quotes from this hit series.',
          imageUrl: 'https://images.unsplash.com/photo-1626379953822-baec19c3accd',
          category: 'TV Shows',
          participants: 312,
          duration: 12,
          startDate: new Date(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          wordCount: 15,
          isActive: true,
        },
      ],
      
      // Word List Actions
      addWordList: (list) => set((state) => {
        const newList: WordList = {
          ...list,
          id: Date.now().toString(),
          progress: 0,
          totalWords: 0,
          words: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        return {
          wordLists: [...state.wordLists, newList],
          userStats: {
            ...state.userStats,
            listsCreated: state.userStats.listsCreated + 1,
          },
        };
      }),
      
      updateWordList: (listId, updates) => set((state) => ({
        wordLists: state.wordLists.map((list) => 
          list.id === listId 
            ? { ...list, ...updates, updatedAt: new Date() } 
            : list
        ),
      })),
      
      deleteWordList: (listId) => set((state) => ({
        wordLists: state.wordLists.filter((list) => list.id !== listId),
      })),
      
      // Word Actions
      addWordToList: (listId, word) => set((state) => {
        const newWord: Word = {
          ...word,
          id: Date.now().toString(),
          learned: false,
          createdAt: new Date(),
        };
        
        const updatedLists = state.wordLists.map((list) => {
          if (list.id === listId) {
            const updatedWords = [...list.words, newWord];
            return {
              ...list,
              words: updatedWords,
              totalWords: updatedWords.length,
              progress: updatedWords.filter(w => w.learned).length / updatedWords.length * 100,
              updatedAt: new Date(),
            };
          }
          return list;
        });
        
        return {
          wordLists: updatedLists,
          userStats: {
            ...state.userStats,
            wordsAdded: state.userStats.wordsAdded + 1,
          },
        };
      }),
      
      updateWord: (listId, wordId, updates) => set((state) => ({
        wordLists: state.wordLists.map((list) => {
          if (list.id === listId) {
            const updatedWords = list.words.map((word) => 
              word.id === wordId ? { ...word, ...updates } : word
            );
            
            return {
              ...list,
              words: updatedWords,
              updatedAt: new Date(),
            };
          }
          return list;
        }),
      })),
      
      deleteWord: (listId, wordId) => set((state) => ({
        wordLists: state.wordLists.map((list) => {
          if (list.id === listId) {
            const updatedWords = list.words.filter((word) => word.id !== wordId);
            return {
              ...list,
              words: updatedWords,
              totalWords: updatedWords.length,
              progress: updatedWords.length > 0 
                ? updatedWords.filter(w => w.learned).length / updatedWords.length * 100 
                : 0,
              updatedAt: new Date(),
            };
          }
          return list;
        }),
      })),
      
      markWordAsLearned: (listId, wordId, learned) => set((state) => {
        let wordsLearnedDelta = 0;
        
        const updatedLists = state.wordLists.map((list) => {
          if (list.id === listId) {
            const updatedWords = list.words.map((word) => {
              if (word.id === wordId) {
                if (learned && !word.learned) {
                  wordsLearnedDelta = 1;
                } else if (!learned && word.learned) {
                  wordsLearnedDelta = -1;
                }
                return { ...word, learned, lastReviewed: new Date() };
              }
              return word;
            });
            
            return {
              ...list,
              words: updatedWords,
              progress: updatedWords.filter(w => w.learned).length / updatedWords.length * 100,
              updatedAt: new Date(),
            };
          }
          return list;
        });
        
        return {
          wordLists: updatedLists,
          userStats: {
            ...state.userStats,
            wordsLearned: state.userStats.wordsLearned + wordsLearnedDelta,
          },
        };
      }),
      
      // Quiz Actions
      saveQuiz: (quiz) => set((state) => {
        const newQuiz: Quiz = {
          ...quiz,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        
        const totalScore = state.quizHistory.length > 0 
          ? (state.userStats.averageScore * state.userStats.quizzesTaken) 
          : 0;
        
        const newScore = quiz.score || 0;
        const newQuizCount = state.userStats.quizzesTaken + 1;
        const newAverageScore = (totalScore + newScore) / newQuizCount;
        
        return {
          quizHistory: [newQuiz, ...state.quizHistory],
          userStats: {
            ...state.userStats,
            quizzesTaken: newQuizCount,
            averageScore: newAverageScore,
            totalXp: state.userStats.totalXp + newScore,
            lastActive: new Date(),
          },
        };
      }),
      
      // User Stats Actions
      updateUserStats: (updates) => set((state) => ({
        userStats: { ...state.userStats, ...updates },
      })),
      
      incrementStreak: () => set((state) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const lastActive = new Date(state.userStats.lastActive).setHours(0, 0, 0, 0);
        const yesterday = today - 86400000;
        
        let newStreak = state.userStats.streak;
        
        if (lastActive === yesterday) {
          newStreak += 1;
        } else if (lastActive < yesterday) {
          newStreak = 1;
        }
        
        return {
          userStats: {
            ...state.userStats,
            streak: newStreak,
            lastActive: new Date(),
          },
        };
      }),
      
      // Settings Actions
      updateUserSettings: (updates) => set((state) => ({
        userSettings: { ...state.userSettings, ...updates },
      })),
      
      // Learning Levels
      unlockLevel: (levelId) => set((state) => ({
        learningLevels: state.learningLevels.map((level) =>
          level.id === levelId ? { ...level, isUnlocked: true } : level
        ),
      })),
      
      completeLevel: (levelId) => set((state) => {
        const updatedLevels = state.learningLevels.map((level) => {
          if (level.id === levelId) {
            return { ...level, isCompleted: true, progress: 100 };
          }
          if (level.id === levelId + 1) {
            return { ...level, isUnlocked: true };
          }
          return level;
        });
        
        return {
          learningLevels: updatedLevels,
          userStats: {
            ...state.userStats,
            totalXp: state.userStats.totalXp + 50,
          },
        };
      }),
      
      updateLevelProgress: (levelId, progress) => set((state) => ({
        learningLevels: state.learningLevels.map((level) =>
          level.id === levelId ? { ...level, progress } : level
        ),
      })),
    }),
    {
      name: 'wordpecker-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);