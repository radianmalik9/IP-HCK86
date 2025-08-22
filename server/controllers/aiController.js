const { GoogleGenerativeAI } = require("@google/generative-ai");

// In-memory cooldown tracker per user/ip to avoid hitting upstream rate limits
// Allow overriding cooldown for tests via env; default 2000ms
const askCooldownMs = Number(process.env.AI_ASK_COOLDOWN_MS || 2000);
const _cooldown = new Map(); // key -> lastTimestamp

function getGenAiModel(modelName) {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('Gemini API key not configured. Set GOOGLE_AI_API_KEY (preferred) or GEMINI_API_KEY in the server env.');
    err.name = 'BadRequest';
    throw err;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const name = modelName || process.env.AI_MODEL || "gemini-1.5-flash"; // lighter model by default
  return genAI.getGenerativeModel({ model: name });
}

async function genWithRetry(model, prompt, attempts = 3) {
  // Make attempts/backoff test-friendly via env
  const maxAttempts = Number(process.env.AI_GEN_ATTEMPTS || attempts);
  let lastErr;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      const status = err?.status || err?.response?.status;
      // Retry on transient rate limit/server errors
      if ((status === 429 || status === 500 || status === 502 || status === 503 || status === 504) && i < maxAttempts - 1) {
        // exponential backoff + jitter (much smaller in tests)
        const baseUnit = process.env.NODE_ENV === 'test' ? 1 : 700;
        const jitterUnit = process.env.NODE_ENV === 'test' ? 0 : 400;
        const base = baseUnit * Math.pow(2, i);
        const jitter = jitterUnit ? Math.floor(Math.random() * jitterUnit) : 0;
        const backoff = base + jitter;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      lastErr = err;
      break;
    }
  }
  throw lastErr;
}

async function genWithFallback(prompt, preferModel) {
  const envFallbacks = (process.env.AI_MODEL_FALLBACKS || '').split(',').map(s => s.trim()).filter(Boolean);
  // In tests, keep the candidate list minimal to avoid long fallback loops
  const baseCandidate = preferModel || process.env.AI_MODEL || 'gemini-1.5-flash';
  const candidates = process.env.NODE_ENV === 'test'
    ? [baseCandidate, ...envFallbacks]
    : [
        baseCandidate,
        ...envFallbacks,
        'gemini-1.5-flash-8b',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
      ];
  const tried = new Set();
  let lastErr;
  for (const name of candidates) {
    if (tried.has(name)) continue;
    tried.add(name);
    const model = getGenAiModel(name);
    try {
      const res = await genWithRetry(model, prompt, 3);
      if (name !== candidates[0]) {
        console.warn(`[AI] Fallback model used: ${name}`);
      }
      return res;
    } catch (err) {
      const status = err?.status || err?.response?.status;
      lastErr = err;
      if (!(status === 429 || status === 500 || status === 502 || status === 503 || status === 504)) {
        break; // non-transient: stop trying
      }
      // otherwise, try next candidate
    }
  }
  throw lastErr;
}

class AIController {
  static async getPersonalizedRecommendations(req, res, next) {
    try {
      const { interests, currentLevel, learningGoals } = req.body;
      
  const model = getGenAiModel();

      const prompt = `
        Based on the following user profile, recommend 5 learning topics and courses:
        
        Interests: ${interests}
        Current Level: ${currentLevel}
        Learning Goals: ${learningGoals}
        
        Please provide recommendations in the following JSON format:
        {
          "recommendations": [
            {
              "topic": "Topic Name",
              "description": "Brief description",
              "difficulty": "beginner/intermediate/advanced",
              "estimatedDuration": "X hours",
              "reason": "Why this is recommended"
            }
          ]
        } dan tolong sertakan alasan mengapa topik ini direkomendasikan. serta jelaskan pake bahasa Indonesia.
      `;

  const result = await genWithRetry(model, prompt, 3);
      let text = '';
      try {
        const response = await result.response;
        text = typeof response?.text === 'function' ? response.text() : '';
      } catch (_) {
        text = '';
      }

      try {
    const parsedResponse = JSON.parse(text);
        res.status(200).json({
          success: true,
          data: parsedResponse
        });
      } catch (parseError) {
        res.status(200).json({
          success: true,
          data: {
            recommendations: [{
              topic: "Personalized Learning Path",
      description: text || 'AI response not in JSON format.',
              difficulty: currentLevel,
              estimatedDuration: "Varies",
              reason: "AI-generated recommendation based on your profile"
            }]
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async generateStudyPlan(req, res, next) {
    try {
      const { courseTitle, userLevel, availableTime, deadline } = req.body;
      
  const model = getGenAiModel();

      const prompt = `
        Create a personalized study plan for the following course:
        
        Course: ${courseTitle}
        User Level: ${userLevel}
        Available Time per Day: ${availableTime} hours
        Deadline: ${deadline}
        
        Please provide a detailed study plan in JSON format:
        {
          "studyPlan": {
            "totalDuration": "X weeks",
            "dailyCommitment": "X hours",
            "weeklyPlan": [
              {
                "week": 1,
                "topics": ["topic1", "topic2"],
                "goals": "Weekly learning goals",
                "timeAllocation": "Time breakdown"
              }
            ],
            "tips": ["Study tip 1", "Study tip 2"],
            "milestones": ["Milestone 1", "Milestone 2"]
          }
        }
      `;

  const result = await genWithRetry(model, prompt, 3);
      let text = '';
      try {
        const response = await result.response;
        text = typeof response?.text === 'function' ? response.text() : '';
      } catch (_) {
        text = '';
      }

      try {
    const parsedResponse = JSON.parse(text);
        res.status(200).json({
          success: true,
          data: parsedResponse
        });
      } catch (parseError) {
        res.status(200).json({
          success: true,
          data: {
            studyPlan: {
              totalDuration: "Custom plan",
              dailyCommitment: availableTime + " hours",
      description: text || 'AI response not in JSON format.',
              tips: ["Follow the AI-generated plan above"]
            }
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async askQuestion(req, res, next) {
    try {
      const { question, context } = req.body;
      
      if (!question || !question.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Pertanyaan tidak boleh kosong.',
        });
      }

  // Basic per-user cooldown - configurable via env (defaults to 2s)
      const key = req.user?.id || req.ip;
      const now = Date.now();
  const cooldownMs = askCooldownMs;
      const last = _cooldown.get(key) || 0;
      const remain = cooldownMs - (now - last);
      if (remain > 0) {
        return res.status(429).json({
          success: false,
          message: `Tunggu ${Math.ceil(remain / 1000)} detik lagi.`,
        });
      }
      _cooldown.set(key, now);
      
      const model = getGenAiModel();

      const prompt = `
        You are an AI learning assistant. Please answer the following question in the context of learning and education:
        
        Question: ${question}
        Context: ${context || 'General learning context'}
        
        Please provide a helpful, educational response in Indonesian language that encourages learning. Be concise but informative.
      `;

      let result;
      try {
        result = await genWithFallback(prompt);
      } catch (err) {
        console.error('[AI] Error in askQuestion:', err);
        const status = err?.status || err?.response?.status;
        const msg = err?.message || 'AI request failed';
        
        if (status === 429) {
          return res.status(429).json({
            success: false,
            message: 'AI sedang sibuk. Coba lagi dalam beberapa detik.',
            detail: 'Rate limited by AI service',
          });
        }
        if (status === 503) {
          return res.status(503).json({
            success: false,
            message: 'Layanan AI sedang overload. Coba lagi dalam 10–20 detik.',
            detail: 'Service unavailable',
          });
        }
        if (status === 400) {
          return res.status(400).json({
            success: false,
            message: 'Pertanyaan tidak valid atau terlalu panjang.',
            detail: msg,
          });
        }
        // For other errors, throw to be handled by error middleware
        throw err;
      }
      
      const response = await result.response;
      const text = response.text();

      res.status(200).json({
        success: true,
        data: {
          question,
          answer: text,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('[AI] Unexpected error in askQuestion:', error);
      next(error);
    }
  }

  static async generateQuiz(req, res, next) {
    try {
      const { topic, difficulty, questionCount = 5 } = req.body;
      
  const model = getGenAiModel();

      const prompt = `
        Generate a quiz about "${topic}" with ${questionCount} questions at ${difficulty} level.
        
        Please provide the quiz in the following JSON format:
        {
          "quiz": {
            "title": "${topic} Quiz",
            "difficulty": "${difficulty}",
            "questions": [
              {
                "id": 1,
                "question": "Question text",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": 0,
                "explanation": "Explanation of the correct answer"
              }
            ]
          }
        }
      `;

  const result = await genWithRetry(model, prompt, 3);
      let text = '';
      try {
        const response = await result.response;
        text = typeof response?.text === 'function' ? response.text() : '';
      } catch (_) {
        text = '';
      }

      try {
    const parsedResponse = JSON.parse(text);
        res.status(200).json({
          success: true,
          data: parsedResponse
        });
      } catch (parseError) {
        res.status(200).json({
          success: true,
          data: {
            quiz: {
              title: topic + " Quiz",
              difficulty: difficulty,
      content: text || 'AI response not in JSON format.'
            }
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async explainConcept(req, res, next) {
    try {
      const { concept, context } = req.body;

      if (!concept || !concept.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Konsep tidak boleh kosong.',
        });
      }

      const model = getGenAiModel();

      const prompt = `Jelaskan konsep berikut dalam bahasa Indonesia yang mudah dipahami: 

Konsep: ${concept}
Konteks: ${context || 'Pembelajaran umum'}

Berikan penjelasan yang:
1. Sederhana dan mudah dipahami
2. Disertai contoh praktis
3. Maksimal 200 kata
4. Mendorong pemahaman lebih lanjut`;

      let result;
      try {
        result = await genWithRetry(model, prompt, 3);
      } catch (err) {
        console.error('[AI] Error in explainConcept:', err);
        const status = err?.status || err?.response?.status;
        
        if (status === 429) {
          return res.status(429).json({
            success: false,
            message: 'AI sedang sibuk. Coba lagi dalam beberapa detik.',
          });
        }
        if (status === 503) {
          return res.status(503).json({
            success: false,
            message: 'Layanan AI sedang overload. Coba lagi nanti.',
          });
        }
        throw err;
      }

      const response = await result.response;
      const text = response.text();

      res.status(200).json({ 
        success: true, 
        data: { 
          concept, 
          explanation: text,
          timestamp: new Date()
        } 
      });
    } catch (error) {
      console.error('[AI] Unexpected error in explainConcept:', error);
      next(error);
    }
  }
}

module.exports = AIController;
