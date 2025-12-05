// Load environment variables
const path = require('path');
const dotenv = require('dotenv');

// Load .env file from project root
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Debug: Log environment variables and paths
console.log('Current directory:', __dirname);
console.log('Loading .env from:', envPath);
console.log('File exists:', require('fs').existsSync(envPath));

// Set API key directly if not in environment (for testing)
if (!process.env.GEMINI_API_KEY) {
    console.warn('WARNING: GEMINI_API_KEY not found in environment variables');
}

// Debug: Show if API key is set (without showing the actual key)
console.log('GEMINI_API_KEY is set:', !!process.env.GEMINI_API_KEY);

// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

// Initialize Gemini AI
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Search schema for student search parameters
const searchSchema = {
    type: "OBJECT",
    properties: {
        skills: { 
            type: "ARRAY",
            description: "A list of technical skills derived from the query, e.g., 'React', 'Python', 'SQL'.",
            items: { "type": "STRING" } 
        },
        experience_years_min: {
            type: "NUMBER",
            description: "The minimum years of professional or project experience requested. Default to 0 if not specified."
        },
        industry_focus: {
            type: "STRING",
            description: "The requested industry focus or experience, e.g., 'Healthcare', 'Finance', 'Energy'. Empty string if not specified."
        },
        limit: {
            type: "NUMBER",
            description: "The maximum number of student profiles to return. Default to 10."
        }
    },
    propertyOrdering: ["skills", "experience_years_min", "industry_focus", "limit"]
};
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// CORS Middleware with proper configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-demo-role'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Body parsing middleware
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/CMIS';

// Simple connection with error handling
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// ========== VECTOR EMBEDDING UTILITIES ==========

/**
 * Generate embedding using Gemini Embedding Model
 */
async function generateEmbedding(text) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/text-embedding-004" });

    const result = await model.embedContent(text);
    const embedding = result.embedding;
    
    console.log('✅ Generated embedding with dimension:', embedding.values.length);
    return embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    console.warn('Invalid vectors for similarity calculation');
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Find top N most similar students based on vector similarity
 * Updated to match your MongoDB schema
 */
async function findSimilarStudents(queryEmbedding, topN = 3) {
  try {
    const db = mongoose.connection.db;
    const studentsCollection = db.collection('Students');  // Updated collection name

    // Fetch all students with embeddings
    const students = await studentsCollection
      .find({ resume_embedding: { $exists: true, $ne: null } })
      .toArray();

    if (students.length === 0) {
      console.log('No students found with embeddings');
      return [];
    }

    console.log(`Comparing with ${students.length} student embeddings...`);

    // Calculate similarity scores
    const studentsWithScores = students.map(student => {
      const similarity = cosineSimilarity(queryEmbedding, student.resume_embedding);
      return {
        _id: student._id,
        studentName: student['Student Name'],  // Updated field name
        emailID: student.emailID,              // Correct field name
        interests: student.Interests,          // Updated field name (capitalized)
        experienceSummary: student['Experience summary'],
        projects: student.projects,
        certifications: student.certifications,
        resumePdf: student['Resume pdfs'],
        similarity_score: similarity
      };
    });

    // Sort by similarity (highest first) and return top N
    const topStudents = studentsWithScores
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, topN);

    console.log(`Top ${topN} students found with scores:`, 
      topStudents.map(s => ({ 
        name: s.studentName, 
        score: s.similarity_score.toFixed(4) 
      }))
    );

    return topStudents;
  } catch (error) {
    console.error('Error finding similar students:', error);
    throw error;
  }
}

// ========== EXISTING ROUTES ==========

// Mock sponsor registrations data
const mockSponsorRegistrations = [
  {
    id: 1,
    eventName: 'Career Fair 2023',
    studentName: 'John Doe',
    status: 'pending',
    date: '2023-11-15T10:30:00Z',
    resume: 'john_doe_resume.pdf'
  },
  {
    id: 2,
    eventName: 'Tech Conference',
    studentName: 'Jane Smith',
    status: 'approved',
    date: '2023-11-20T14:00:00Z',
    resume: 'jane_smith_resume.pdf'
  },
  {
    id: 3,
    eventName: 'Networking Mixer',
    studentName: 'Alex Johnson',
    status: 'rejected',
    date: '2023-11-25T16:45:00Z',
    resume: 'alex_johnson_resume.pdf'
  }
];

// Sponsor Registrations Endpoint
app.get('/api/sponsor/registrations', (req, res) => {
  console.log('Fetching sponsor registrations');
  try {
    res.json({
      success: true,
      registrations: mockSponsorRegistrations
    });
  } catch (error) {
    console.error('Error fetching sponsor registrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registrations'
    });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Import auth middleware
const { protect } = require('./middleware/auth');

// List available models endpoint
app.get('/api/models', async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const knownModels = [
            'gemini-pro',
            'gemini-1.5-pro-latest',
            'gemini-1.0-pro',
            'gemini-1.0-pro-001',
            'gemini-1.0-pro-latest',
            'gemini-embedding-004'
        ];
        
        res.json({
            success: true,
            models: knownModels,
            note: 'These are common model names. The actual available models depend on your API key and region.'
        });
    } catch (error) {
        console.error('Error listing models:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list models',
            details: error.message
        });
    }
});

// ========== UPDATED STUDENT SEARCH ENDPOINT WITH VECTOR SIMILARITY ==========

app.post('/api/student/search', express.json(), async (req, res) => {
    // CORS Headers
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-user-id, x-demo-role');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { query } = req.body;
    console.log('Received request with body:', req.body);
    
    if (!query) {
        console.error('No query provided in request');
        return res.status(400).json({ 
            success: false, 
            error: 'Query parameter is required.' 
        });
    }
    
    console.log('Processing LLM Query:', query);
    
    try {
        // Initialize Gemini AI
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "models/gemini-2.5-flash-preview-09-2025",  // Add models/ prefix
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.3,
            },
        });

        const systemPrompt = `Extract key requirements from this query and return as JSON. Include: technical skills, experience level, min years of experience, project types, and additional requirements. Format:
{
    "skills": ["list", "of", "skills"],
    "experienceLevel": "internship/entry/mid/senior",
    "minYearsExperience": number,
    "projectTypes": ["project", "types"],
    "additionalRequirements": ["any", "other", "requirements"]
}
Only return the JSON object.`;

        console.log('Sending prompt to Gemini...');
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nQuery: ${query}\n\nJSON:` }]
            }]
        });

        const response = await result.response;
        let responseText = response.text().trim();
        console.log('Raw LLM response:', responseText);

        let parsedResponse;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in response');
            
            parsedResponse = JSON.parse(jsonMatch[0]);
            console.log('Parsed LLM response:', parsedResponse);
            
        } catch (parseError) {
            console.error('Error parsing LLM response:', parseError);
            throw new Error(`Failed to parse LLM response: ${parseError.message}`);
        }

        // ========== VECTOR SIMILARITY SEARCH ==========
        console.log('Generating embedding for query...');
        const queryEmbedding = await generateEmbedding(query);
        
        console.log('Finding similar students...');
        const similarStudents = await findSimilarStudents(queryEmbedding, 3);

        // Return both LLM parsed response and similar students
        res.json({
            success: true,
            llm_response: parsedResponse,
            similar_students: similarStudents,
            total_matches: similarStudents.length
        });

    } catch (error) {
        console.error('Error in search endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process search query'
        });
    }
});

// ========== DEDICATED VECTOR SEARCH ENDPOINT ==========

/**
 * Endpoint specifically for vector similarity search
 * Can be used independently of LLM processing
 */
app.post('/api/student/vector-search', express.json(), async (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-user-id, x-demo-role');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { query, topN } = req.body;
    
    if (!query) {
        return res.status(400).json({ 
            success: false, 
            error: 'Query parameter is required.' 
        });
    }

    console.log('Vector search query:', query);
    console.log('Requesting top:', topN || 3);

    try {
        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);
        
        // Find similar students
        const similarStudents = await findSimilarStudents(queryEmbedding, topN || 3);

        res.json({
            success: true,
            query: query,
            results: similarStudents,
            count: similarStudents.length
        });

    } catch (error) {
        console.error('Error in vector search endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to perform vector search'
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Allowed Origins: *');
  console.log('Allowed Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
  console.log('Vector search enabled with gemini-embedding-004');
});