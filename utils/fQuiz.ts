interface QuizQuestion {
  question: string;
  comment: string;
  test_answer: number;
  answers: string[];
}

interface QuizTestGroup {
  test_group: number;
  next_test_group: number;
  question: QuizQuestion[];
}

interface QuizApiResponse {
  test: QuizTestGroup;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const API_BASE_URL = 'https://api-ghz-v2.azurewebsites.net/api/v2/quiz';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const fetchQuiz = async (level: string): Promise<QuizApiResponse> => {
  let lastError: Error | null = null;
  
  console.log(`Attempting to fetch quiz for level ${level}`);
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to fetch quiz for level ${level}`);
      
      const url = `${API_BASE_URL}?level=${level}`;
      console.log('Fetching from URL:', url);
      
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        next: { revalidate: 0 } // Disable caching at the Next.js level
      });

      console.log('Response status:', res.status);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch quiz: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Received data structure:', {
        hasTest: !!data?.test,
        hasQuestion: !!data?.test?.question,
        isQuestionArray: Array.isArray(data?.test?.question),
        questionCount: Array.isArray(data?.test?.question) ? data.test.question.length : 0
      });
      
      // Validate the response structure
      if (!data?.test?.question || !Array.isArray(data.test.question)) {
        throw new Error('Invalid quiz data structure');
      }

      if (data.test.question.length === 0) {
        throw new Error('Quiz has no questions');
      }

      console.log(`Successfully fetched quiz for level ${level} with ${data.test.question.length} questions`);
      return data;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed for level ${level}:`, error);
      
      // If this isn't the last attempt, wait before retrying
      if (attempt < MAX_RETRIES - 1) {
        const delayTime = RETRY_DELAY * (attempt + 1);
        console.log(`Waiting ${delayTime}ms before retry...`);
        await delay(delayTime); // Exponential backoff
      }
    }
  }

  // If we get here, all retries failed
  const errorMessage = `Failed to fetch quiz after ${MAX_RETRIES} attempts: ${lastError?.message}`;
  console.error(errorMessage);
  throw new Error(errorMessage);
};



const fetchQuestion = async() => { 
  const quresponse = await fetch("https://api-ghz-v2.azurewebsites.net/api/v2/quiz?level=8")
  const questions = quresponse.json()
}