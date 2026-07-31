import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for Gemini AI completions
async function runGeminiTask(systemPrompt: string, userPrompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });
    return response.text || 'Action completed successfully.';
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return `AI Processing Error: ${err.message || 'Unable to contact AI core service.'}`;
  }
}

// ------------------- API ENDPOINTS ------------------- //

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'BuiltAura AI Enterprise Business OS',
    version: 'v3.4.0-Enterprise',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? 'Connected (Gemini 3.6 Flash)' : 'Offline (Missing API Key)',
  });
});

// 2. Department AI Agent Endpoint
app.post('/api/ai/agent', async (req: Request, res: Response) => {
  const { department, action, prompt, context } = req.body;

  const systemInstruction = `You are the primary autonomous AI Agent for the ${department.toUpperCase()} department in BuiltAura AI enterprise business operating system.
Action requested: "${action}".
Provide a clear, authoritative, executive-level response formatted in structured markdown.
Include:
1. Executive Summary & Decision
2. Strategic Key Metrics / Impacts
3. Recommended Immediate Action Items`;

  const userContent = `Context: ${JSON.stringify(context || {})}
Specific User Prompt: ${prompt || 'Perform autonomous department status review and optimize performance.'}`;

  const result = await runGeminiTask(systemInstruction, userContent);
  res.json({
    success: true,
    department,
    action,
    result,
    timestamp: new Date().toISOString(),
  });
});

// 3. AI Executive Assistant Endpoint ("Aura Executive")
app.post('/api/ai/executive-assistant', async (req: Request, res: Response) => {
  const { prompt, tenant, currentView } = req.body;

  const systemInstruction = `You are "Aura Executive", the master omnipresent AI Executive Assistant for BuiltAura AI Business OS.
You hold full cross-department authority across CEO, Sales, Marketing, HR, Support, Finance, Operations, Dev, CRM, and Systems.
Respond professionally, concisely, and decisively.
Structure your response into:
- 💡 Executive Guidance & Decision
- 🚀 Cross-Department Agent Execution Strategy
- 📊 Quantifiable Projected ROI / Metrics
- 📋 Recommended Next Steps`;

  const userContent = `Tenant Context: ${tenant || 'Aura Corp Global Enterprise'}
Current View: ${currentView || 'CEO Dashboard'}
Executive Request: "${prompt}"`;

  const result = await runGeminiTask(systemInstruction, userContent);
  res.json({
    success: true,
    result,
    timestamp: new Date().toISOString(),
  });
});

// 4. Knowledge Base & RAG Vector Query
app.post('/api/ai/knowledge-search', async (req: Request, res: Response) => {
  const { query, documentIds } = req.body;

  const systemInstruction = `You are the pgvector Knowledge Base Query Engine for BuiltAura AI.
Your role is to perform RAG semantic search across enterprise PDF specs, policies, and playbooks.
Synthesize a direct answer citing source documents. Format with high readability.`;

  const result = await runGeminiTask(systemInstruction, `Query: "${query}". Selected Doc Scope: ${JSON.stringify(documentIds || 'All Documents')}`);
  res.json({
    success: true,
    query,
    answer: result,
    sourcesUsed: ['doc-101: System Architecture', 'doc-102: Multi-Tenant RBAC Security Policy'],
    similarityScore: 0.94,
  });
});

// 5. Document Processing Endpoint
app.post('/api/ai/document-process', async (req: Request, res: Response) => {
  const { docTitle, docContent } = req.body;

  const systemInstruction = `You are the Document Intelligence Engine in BuiltAura AI.
Analyze the provided document text and generate an enterprise executive analysis:
- Document Type & Classification
- Key Risk Factors & Compliance Notes
- Actionable Operational Takeaways
- Vector Embedding Metadata`;

  const result = await runGeminiTask(systemInstruction, `Document Title: ${docTitle}\nContent: ${docContent}`);
  res.json({
    success: true,
    docTitle,
    analysis: result,
    vectorChunkCount: Math.ceil((docContent || '').length / 250) + 5,
  });
});

// 6. Workflow Engine Execution Endpoint
app.post('/api/ai/workflow-trigger', async (req: Request, res: Response) => {
  const { workflowName, triggerData } = req.body;

  const systemInstruction = `You are the Workflow Automation Engine in BuiltAura AI.
Evaluate trigger conditions and simulate execution of cross-department AI actions.
Output an execution audit log with status, steps taken, and downstream system triggers.`;

  const result = await runGeminiTask(systemInstruction, `Workflow: ${workflowName}\nTrigger Payload: ${JSON.stringify(triggerData)}`);
  res.json({
    success: true,
    workflowName,
    executionLog: result,
    status: 'COMPLETED',
    timestamp: new Date().toISOString(),
  });
});

// 6b. Multi-Agent System Orchestration & Goal Decomposition
app.post('/api/ai/multi-agent/orchestrate', async (req: Request, res: Response) => {
  const { goal, priority, selectedAgents, contextData } = req.body;

  const systemInstruction = `You are the Master Orchestrator in a 9-Agent Multi-Agent Business System.
Agents Available:
1. CEO Agent (Aura-Executive-1) - Strategy, Okrs, Delegation
2. Sales Agent (SalesPulse-AI) - Pipeline, Lead Qualification, CRM
3. Marketing Agent (OmniGrowth-AI) - Campaigns, Copywriting, Lead Gen
4. HR Agent (TalentScout-AI) - Recruiting, Resumes, Onboarding
5. Finance Agent (LedgerMind-AI) - Audit, Ledger, Budget Guardrails
6. Operations Agent (OpsMaster-AI) - Supply Chain, Vendor SLAs, Workflows
7. Developer Agent (CodeArchitect-AI) - Microservices, CI/CD, Deployment
8. Support Agent (Resolver-Support-AI) - L1/L2 Support, Escalations, CSAT
9. Analytics Agent (DataSight-AI) - SQL Warehouse, Cohort Models, BI

For the goal: "${goal}", generate an orchestrated plan breakdown formatted in structured markdown including:
1. Executive Goal Strategy & Consensus Score (0-100%)
2. Multi-Agent Step-by-Step Execution Plan (with assigned agents, dependency order, reasoning chains)
3. Permission & Clearance Boundary Checks
4. Risk Mitigation & Self-Correcting Error Recovery Strategy
5. Downstream Impact Metrics & Human-in-the-Loop Approval Triggers`;

  const userContent = `Priority: ${priority || 'HIGH'}
Selected Active Agents: ${JSON.stringify(selectedAgents || ['agent-ceo', 'agent-sales', 'agent-finance', 'agent-dev', 'agent-analytics'])}
Context: ${JSON.stringify(contextData || {})}`;

  const result = await runGeminiTask(systemInstruction, userContent);
  res.json({
    success: true,
    goal,
    orchestrationPlan: result,
    consensusScore: Math.floor(Math.random() * 12) + 88,
    timestamp: new Date().toISOString(),
  });
});

// 6c. Multi-Agent Debate & Consensus Engine
app.post('/api/ai/multi-agent/debate', async (req: Request, res: Response) => {
  const { topic, agentA, agentB, perspectiveContext } = req.body;

  const systemInstruction = `You are a Multi-Agent Debate & Consensus Synthesis Engine.
Facilitate a structured debate between two or more AI business agents on topic: "${topic}".
Agent A: ${agentA || 'Sales Agent'} (Focus: Revenue Growth & Aggressive Acquisition)
Agent B: ${agentB || 'Finance Agent'} (Focus: Cashflow Preservation, ROI, & Risk Guardrails)

Generate a 3-turn debate dialogue:
1. Argument from ${agentA || 'Agent A'}
2. Counter-argument & Risk Guardrail from ${agentB || 'Agent B'}
3. CEO Agent Synthesis & Consensus Resolution Vote (with numerical confidence score)
Format cleanly in Markdown.`;

  const result = await runGeminiTask(systemInstruction, `Perspective Context: ${perspectiveContext || 'Q3 Expansion Strategy vs Capital Budget Bounds'}`);
  res.json({
    success: true,
    topic,
    debateTranscript: result,
    consensusVote: 'APPROVED WITH BUDGET GUARDRAILS',
    confidenceScore: 94.5,
    timestamp: new Date().toISOString(),
  });
});

// 6d. Multi-Agent Long-Term Memory & RAG Retrieval
app.post('/api/ai/multi-agent/memory', async (req: Request, res: Response) => {
  const { query, requestingAgentId } = req.body;

  const systemInstruction = `You are the Central Long-Term Vector Memory System for the 9 Multi-Agent Core.
Search and synthesize stored memories, learned error corrections, and company rules for query: "${query}".
Return structured memory insights with source vector chunk IDs and clearance permissions.`;

  const result = await runGeminiTask(systemInstruction, `Requesting Agent ID: ${requestingAgentId || 'agent-ceo'}`);
  res.json({
    success: true,
    query,
    memoriesFound: result,
    vectorChunksSearched: 1840,
    timestamp: new Date().toISOString(),
  });
});

// 7. AI Sales Department - Lead Qualification Endpoint
app.post('/api/sales/qualify-lead', async (req: Request, res: Response) => {
  const { lead, budget, authority, need, timeline } = req.body;

  const systemInstruction = `You are an AI Sales Lead Qualification Agent powered by BANT framework.
Evaluate the prospect's parameters:
- Budget: ${budget || '$100k+'}
- Authority: ${authority || 'Decision Maker'}
- Need: ${need || 'Enterprise AI Transformation'}
- Timeline: ${timeline || 'Immediate (Q3)'}

Provide a JSON object or clear structured markdown report detailing:
1. Overall BANT Qualification Score (0-100)
2. Qualification Status: "Hot Lead", "Warm Prospect", or "Unqualified"
3. Key Buying Intent Signals
4. Risk Factors / Objections
5. Automated Follow-up Strategy & Recommended Next Actions`;

  const userContent = `Evaluate Prospect: ${JSON.stringify(lead || { companyName: 'Prospect Co', dealValue: 150000 })}`;
  const result = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    qualificationResult: result,
    bantScore: Math.floor(Math.random() * 15) + 85,
    status: 'Hot Lead',
    timestamp: new Date().toISOString(),
  });
});

// 8. AI Sales Department - Multi-Channel Customer Chat Auto-Reply Endpoint
app.post('/api/sales/customer-chat', async (req: Request, res: Response) => {
  const { channel, message, contactName, companyName, productCatalog } = req.body;

  const systemInstruction = `You are SalesPulse-AI, an autonomous conversational AI Sales Representative operating on ${channel || 'WhatsApp'}.
Your objective is to:
1. Enthusiastically and professionally answer customer questions about products, pricing, integration, and security.
2. Qualify customer intent gracefully.
3. Suggest scheduling a product demo or sending a formal quotation.
Keep the tone natural, helpful, concise, and conversion-focused suitable for ${channel || 'WhatsApp/Email'}.`;

  const userContent = `Customer: ${contactName || 'Valued Prospect'} from ${companyName || 'Enterprise Client'}
Channel: ${channel || 'WhatsApp'}
Customer Message: "${message || 'Hi, what are your enterprise pricing tiers and security compliance specs?'}"
Product Context: ${productCatalog || 'BuiltAura Enterprise AI Business OS, $150k-$500k ARR tiers, SOC2 Type II, ISO27001'}`;

  const reply = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    channel,
    aiReply: reply,
    suggestedFollowUp: 'Schedule 30-min Executive Demo',
    timestamp: new Date().toISOString(),
  });
});

// 9. AI Sales Department - Document Generator Endpoint (Quotation, Invoice, Proposal, Contract)
app.post('/api/sales/generate-document', async (req: Request, res: Response) => {
  const { docType, companyName, contactName, items, totalAmount, specialTerms } = req.body;

  const systemInstruction = `You are BuiltAura Sales Document Engine.
Generate a comprehensive, legally sound, highly professional enterprise ${docType?.toUpperCase() || 'PROPOSAL'}.
Include:
- Executive Cover Header & Document Metadata
- Scope of Work & Deliverables
- Itemized Financial Table breakdown ($${totalAmount || 150000})
- Compliance, Warranty & Intellectual Property Terms
- E-Signature Execution Block`;

  const userContent = `Document Type: ${docType}
Company: ${companyName}
Contact: ${contactName}
Line Items: ${JSON.stringify(items || [])}
Total Amount: $${totalAmount || 150000}
Special Terms: ${specialTerms || 'Standard Net 30 payment terms, 12-month SLA guarantee'}`;

  const generatedDoc = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    docType,
    documentContent: generatedDoc,
    docNumber: `${docType?.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 90000) + 10000}`,
    timestamp: new Date().toISOString(),
  });
});

// 10. AI Sales Department - Appointment Booking & Automated Follow-Up
app.post('/api/sales/book-appointment', async (req: Request, res: Response) => {
  const { contactName, companyName, email, date, timeSlot, meetingType } = req.body;

  const systemInstruction = `You are the AI Appointment Assistant for BuiltAura Sales.
Write a warm, executive calendar invitation confirmation and automated reminder plan for ${contactName} at ${companyName}.
Include meeting agenda, video link placeholder, and 24-hour / 1-hour automated reminder text.`;

  const userContent = `Contact: ${contactName} (${email})
Company: ${companyName}
Date & Time: ${date} at ${timeSlot}
Meeting Type: ${meetingType || '30-Min AI Platform Demo & Discovery'}`;

  const confirmation = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    bookingId: `APPT-${Math.floor(Math.random() * 9000) + 1000}`,
    confirmationMessage: confirmation,
    reminderScheduled: true,
    timestamp: new Date().toISOString(),
  });
});

// 11. AI Marketing Department - Multi-Format Content Generator Endpoint
app.post('/api/marketing/generate-content', async (req: Request, res: Response) => {
  const { contentType, topic, targetAudience, tone, primaryKeyword } = req.body;

  const systemInstruction = `You are OmniGrowth-AI, an expert AI Marketing Director and Creative Copywriter.
Your task is to generate a complete, high-converting ${contentType?.toUpperCase() || 'MARKETING CONTENT'} asset on the topic: "${topic || 'Enterprise AI Business Automation'}".

Target Audience: ${targetAudience || 'B2B Executives, CTOs, Marketing Directors'}
Tone: ${tone || 'Authoritative, Engaging, High-Converting'}
Primary Keyword: ${primaryKeyword || 'AI Business OS'}

You MUST structure your output clearly with:
1. Full Title / Headline
2. Complete Body Copy formatted appropriately for ${contentType} (e.g. including Hooks, Paragraphs, Call To Action)
3. 5-8 Strategic Hashtag Suggestions
4. AI Image Generation Prompt (for visual asset creation)
5. AI Video Scene Storyboard & Voiceover Script (for video formats like TikTok / Reels / Video Scripts)
6. SEO Meta Description & Suggested Keywords`;

  const userContent = `Content Format: ${contentType}
Topic: ${topic}
Target Audience: ${targetAudience}
Tone: ${tone}
Primary Keyword: ${primaryKeyword}`;

  const generatedContent = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    contentType,
    topic,
    generatedContent,
    hashtags: [
      `#${(primaryKeyword || 'AIBusiness').replace(/\s+/g, '')}`,
      '#EnterpriseAI',
      '#BusinessAutomation',
      '#FutureOfWork',
      '#TechLeadership',
      '#B2BMarketing',
      '#GrowthHacking',
    ],
    aiImagePrompt: `A sleek high-tech 3D render illustration representing ${topic || 'AI Business Automation'}, futuristic neon cyan and violet accents, isometric glassmorphism cards, ultra detailed 8K resolution.`,
    aiVideoPrompt: `Cinematic 4K camera panning over futuristic digital command center showcasing ${topic || 'Enterprise AI'}, dynamic particle lighting, high motion.`,
    timestamp: new Date().toISOString(),
  });
});

// 12. AI Marketing Department - SEO & Keyword Research Endpoint
app.post('/api/marketing/keyword-research', async (req: Request, res: Response) => {
  const { seedKeyword, industry } = req.body;

  const systemInstruction = `You are an AI SEO & Keyword Research Specialist.
Analyze the seed keyword: "${seedKeyword || 'AI Automation'}" in the industry "${industry || 'B2B SaaS'}".
Provide a detailed markdown analysis with:
1. Search Intent Analysis
2. Top 5 High-Volume Primary & Secondary Keywords
3. Keyword Difficulty & Monthly Volume Estimates
4. Search Engine Results Page (SERP) Competitor Gaps
5. Recommended Content Clusters & Article Ideas`;

  const userContent = `Seed Keyword: ${seedKeyword}
Industry: ${industry}`;

  const analysis = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    seedKeyword,
    analysis,
    keywords: [
      { keyword: `${seedKeyword} software`, volume: 24500, difficulty: 42, cpc: 8.5, intent: 'Commercial', opportunityScore: 92 },
      { keyword: `best ${seedKeyword} platform`, volume: 18200, difficulty: 58, cpc: 12.4, intent: 'Transactional', opportunityScore: 88 },
      { keyword: `how to implement ${seedKeyword}`, volume: 14100, difficulty: 31, cpc: 5.2, intent: 'Informational', opportunityScore: 95 },
      { keyword: `enterprise ${seedKeyword} ROI`, volume: 9800, difficulty: 49, cpc: 15.1, intent: 'Commercial', opportunityScore: 85 },
      { keyword: `${seedKeyword} vs manual workflow`, volume: 6400, difficulty: 24, cpc: 6.8, intent: 'Informational', opportunityScore: 98 },
    ],
    timestamp: new Date().toISOString(),
  });
});

// 16. HR System - AI Resume Screening Endpoint
app.post('/api/hr/resume-screening', async (req: Request, res: Response) => {
  const { candidateName, position, resumeText, requiredSkills } = req.body;

  const systemInstruction = `You are TalentScout-AI, an expert Senior HR Director and AI Resume Screening Engine.
Analyze candidate "${candidateName || 'Applicant'}" applying for position "${position || 'Software Engineer'}".
Required Skills: ${Array.isArray(requiredSkills) ? requiredSkills.join(', ') : requiredSkills || 'General Technical Skills'}.
Resume Text provided: "${resumeText || 'No detailed resume attached, evaluating candidate overview.'}".

Provide a structured HR evaluation:
1. Candidate Match Score (0 to 100%)
2. Key Strengths & Technical Competencies
3. Potential Skill Gaps or Red Flags
4. 5 Tailored Interview Questions
5. Final Hiring Recommendation (Strong Hire, Hire, On Hold, Decline)`;

  const userContent = `Candidate: ${candidateName}, Position: ${position}, Resume: ${resumeText}`;
  const screeningAnalysis = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    candidateName,
    position,
    matchScore: Math.floor(Math.random() * 20) + 80,
    screeningAnalysis,
    timestamp: new Date().toISOString(),
  });
});

// 17. HR System - AI Interview Assistant Endpoint
app.post('/api/hr/interview-assistant', async (req: Request, res: Response) => {
  const { candidateName, position, candidateAnswer, targetTopic } = req.body;

  const systemInstruction = `You are TalentScout-AI Live Interview Copilot.
Evaluate candidate response or generate specialized interview questions for position "${position || 'Lead Architect'}".
Topic: ${targetTopic || 'System Architecture & Problem Solving'}.
Candidate Name: ${candidateName || 'Candidate'}.
Candidate Answer provided: "${candidateAnswer || 'Initial Question Generation Requested'}".

Provide:
1. Live Candidate Score (1-10) for clarity, technical depth, and communication
2. Instant Answer Assessment & Red Flags
3. 3 Follow-up Deep-Dive Technical Questions
4. Recommended Hiring Note for Manager`;

  const userContent = `Candidate: ${candidateName}, Position: ${position}, Topic: ${targetTopic}, Answer: ${candidateAnswer}`;
  const evaluationResult = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    candidateName,
    evaluationResult,
    timestamp: new Date().toISOString(),
  });
});

// 18. HR System - AI Performance Review Endpoint
app.post('/api/hr/performance-review', async (req: Request, res: Response) => {
  const { employeeName, role, accomplishments, managerFeedback } = req.body;

  const systemInstruction = `You are TalentScout-AI Performance & HR Evaluation Engine.
Synthesize a formal quarterly/annual Performance Review for:
Employee: ${employeeName || 'Employee'}
Role: ${role || 'Senior Specialist'}
Accomplishments: ${accomplishments || 'Met sprint targets, mentored team.'}
Manager Feedback: ${managerFeedback || 'Strong technical delivery.'}

Provide:
1. Overall Performance Rating (1.0 to 5.0 stars)
2. Strategic Strengths & Core Value Alignment
3. Key Areas for Improvement & Skill Development
4. 3 SMART Goals for Next Cycle
5. Promotion / Compensation Review Recommendation`;

  const userContent = `Employee: ${employeeName}, Role: ${role}, Accomplishments: ${accomplishments}, Feedback: ${managerFeedback}`;
  const reviewReport = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    employeeName,
    reviewReport,
    timestamp: new Date().toISOString(),
  });
});

// 14. Finance Management System - Stripe Payment Gateway Endpoint
app.post('/api/finance/stripe-payment-link', async (req: Request, res: Response) => {
  const { invoiceId, invoiceNumber, clientName, amount, currency = 'USD' } = req.body;

  // Simulate Stripe Checkout Session Creation
  const sessionId = `cs_live_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}#${invoiceNumber || 'INV-2026'}`;

  res.json({
    success: true,
    invoiceId,
    invoiceNumber,
    clientName,
    amount,
    currency,
    stripeSessionId: sessionId,
    paymentUrl: checkoutUrl,
    status: 'payment_link_created',
    qrCodeData: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(checkoutUrl)}`,
    timestamp: new Date().toISOString(),
  });
});

// 15. Finance Management System - AI Forecasting Endpoint
app.post('/api/finance/forecasting', async (req: Request, res: Response) => {
  const { currentMRR, cashBalance, monthlyBurnRate, historicalData } = req.body;

  const systemInstruction = `You are LedgerMind-AI, an expert Chief Financial Officer (CFO) and Financial Modeling Specialist.
Analyze the company's financial health:
- Current MRR: $${currentMRR || 185000}
- Cash Balance: $${cashBalance || 620000}
- Monthly Burn Rate: $${monthlyBurnRate || 42000}

Provide a structured financial forecast breakdown covering:
1. 3-Month, 6-Month, and 12-Month Revenue & Cash Runway Projections
2. Scenario Analysis (Bull Case, Base Case, Bear Case)
3. Key Financial Risk Drivers & Mitigations
4. Strategic Capital Allocation Recommendations`;

  const userContent = `Financial Data: MRR $${currentMRR}, Cash $${cashBalance}, Burn $${monthlyBurnRate}, Details: ${JSON.stringify(historicalData || {})}`;

  const forecastAnalysis = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    forecastAnalysis,
    projections: [
      { month: 'Month 1', baseRevenue: (currentMRR || 185000) * 1.05, bullRevenue: (currentMRR || 185000) * 1.10, bearRevenue: (currentMRR || 185000) * 0.98, runwayMonths: 14.8 },
      { month: 'Month 3', baseRevenue: (currentMRR || 185000) * 1.16, bullRevenue: (currentMRR || 185000) * 1.25, bearRevenue: (currentMRR || 185000) * 0.95, runwayMonths: 14.2 },
      { month: 'Month 6', baseRevenue: (currentMRR || 185000) * 1.35, bullRevenue: (currentMRR || 185000) * 1.55, bearRevenue: (currentMRR || 185000) * 0.90, runwayMonths: 13.5 },
      { month: 'Month 12', baseRevenue: (currentMRR || 185000) * 1.80, bullRevenue: (currentMRR || 185000) * 2.20, bearRevenue: (currentMRR || 185000) * 0.85, runwayMonths: 12.0 },
    ],
    timestamp: new Date().toISOString(),
  });
});

// 16. Finance Management System - AI Anomaly Detection Endpoint
app.post('/api/finance/anomaly-detection', async (req: Request, res: Response) => {
  const { transactions, expenses } = req.body;

  const systemInstruction = `You are an AI Forensic Accountant and Fraud Prevention Agent.
Scan the provided financial transactions and expenses. Identify any anomalies, duplicate charges, unexpected cost spikes, or suspicious spending patterns.
Provide a clear markdown report detailing:
1. Detected Anomalies & Risk Level (High / Medium / Low)
2. Root Cause Analysis
3. Recommended Immediate Action Items`;

  const userContent = `Transactions & Expenses: ${JSON.stringify((transactions || []).slice(0, 10))}`;

  const auditReport = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    auditReport,
    detectedAnomalies: [
      { id: 'anom-1', severity: 'High', category: 'Expense Spike', description: 'Cloud Infrastructure cost jumped 142% compared to 30-day trailing average ($18,400 vs $7,600).', action: 'Inspect AWS GPU instance provisioning logs.', timestamp: new Date().toISOString() },
      { id: 'anom-2', severity: 'Medium', category: 'Duplicate Vendor Invoice', description: 'Potential duplicate charge detected from SaaS Vendor "DataPipeline Inc" ($1,250 on July 14 and July 16).', action: 'Flag for AP team review before approval.', timestamp: new Date().toISOString() },
      { id: 'anom-3', severity: 'Low', category: 'Late Payment Overdue', description: 'Invoice INV-2026-089 ($35,000) from Nexus Global is 18 days overdue.', action: 'Trigger automated Stage 2 payment reminder.', timestamp: new Date().toISOString() },
    ],
    timestamp: new Date().toISOString(),
  });
});

// 17. Finance Management System - Automatic Monthly Financial Report Endpoint
app.post('/api/finance/monthly-report', async (req: Request, res: Response) => {
  const { month = 'July 2026', totalRevenue, totalExpenses, netIncome } = req.body;

  const systemInstruction = `You are LedgerMind-AI, Chief Financial Officer.
Draft a comprehensive, executive-ready Monthly Financial Performance Report for the period: ${month}.
Include:
1. Executive Summary & Financial Highlights
2. Revenue Breakdown & Gross Margin Analysis
3. Operating Expenses & Variance Analysis
4. Cash Flow & Working Capital Position
5. Tax Reserves & Compliance Status
6. Strategic Financial Recommendations for Next Quarter`;

  const userContent = `Period: ${month}
Total Revenue: $${totalRevenue || 485000}
Total Expenses: $${totalExpenses || 210000}
Net Income: $${netIncome || 275000}`;

  const reportMarkdown = await runGeminiTask(systemInstruction, userContent);

  res.json({
    success: true,
    period: month,
    reportMarkdown,
    metrics: {
      grossMargin: '78.4%',
      netProfitMargin: '56.7%',
      ebitda: `$${((netIncome || 275000) * 1.12).toLocaleString()}`,
      taxReserveAllocated: `$${((netIncome || 275000) * 0.21).toLocaleString()}`,
    },
    timestamp: new Date().toISOString(),
  });
});

// 18. Finance Management System - Automated Payment Reminder Generator
app.post('/api/finance/payment-reminder', async (req: Request, res: Response) => {
  const { invoiceNumber, clientName, amount, daysOverdue, dueDate } = req.body;

  const systemInstruction = `You are an AI Accounts Receivable Specialist.
Write a polite yet firm payment reminder message for invoice ${invoiceNumber || 'INV-2026-042'}.
Client: ${clientName || 'Apex Technologies'}
Amount Due: $${amount || 15000}
Due Date: ${dueDate || '2026-07-10'}
Days Overdue: ${daysOverdue || 19} days

Include:
- Professional tone appropriate for the days overdue
- Calculation of standard 1.5% monthly late interest fee if applicable
- Direct link placeholder to make payment via Stripe
- Contact details for payment arrangements`;

  const reminderMessage = await runGeminiTask(systemInstruction, `Client: ${clientName}, Invoice: ${invoiceNumber}, Overdue: ${daysOverdue} days`);

  res.json({
    success: true,
    invoiceNumber,
    clientName,
    reminderMessage,
    lateFeeApplied: daysOverdue > 15 ? (amount || 15000) * 0.015 : 0,
    timestamp: new Date().toISOString(),
  });
});

// 19. Customer Support Platform - AI Chatbot & Common Question Answer / Escalation Engine
app.post('/api/support/ai-chatbot', async (req: Request, res: Response) => {
  const { customerName, channel, userMessage, conversationHistory } = req.body;

  const systemInstruction = `You are BuiltAura Support-AI, a Senior Customer Support Bot with Tier 1/2 resolution and escalation intelligence.
Channel: ${channel || 'Live Chat'} (Options: Live Chat, WhatsApp, Email).
Customer: ${customerName || 'Valued Customer'}.

Analyze user message: "${userMessage}".
Task:
1. Determine if this is a COMMON QUESTION (e.g. password reset, billing receipt, API keys, basic configuration, business hours, refund policy) OR a COMPLEX TECHNICAL ISSUE (e.g. database deadlocks, custom OAuth JWT failure, enterprise SLA breach, custom microservice bug).
2. If COMMON QUESTION: Provide a clear, polite, step-by-step resolution immediately.
3. If COMPLEX TECHNICAL ISSUE: Provide an empathetic initial holding message, explain that you are escalating to Tier 2/3 Senior Engineers, and draft an internal Escalation Ticket Summary.

Format output with clear headers:
- 🎯 Query Classification: [Common Question / Complex Issue]
- 💬 Response Message: [Message for Customer]
- 🚨 Escalation Status: [Resolved by AI / Escalated to L2 Technical Support]
- 📋 Internal Agent Ticket Note: [Diagnostic summary for human support]`;

  const responseText = await runGeminiTask(systemInstruction, `Customer: ${customerName}, Message: "${userMessage}"`);

  const isComplex = responseText.toLowerCase().includes('complex issue') || responseText.toLowerCase().includes('escalat');

  res.json({
    success: true,
    channel: channel || 'Live Chat',
    customerName,
    aiResponse: responseText,
    isEscalated: isComplex,
    detectedSentiment: responseText.toLowerCase().includes('frustrat') || responseText.toLowerCase().includes('urgent') ? 'Urgent / Negative' : 'Positive / Neutral',
    priority: isComplex ? 'High / Urgent' : 'Low / Medium',
    timestamp: new Date().toISOString(),
  });
});

// 20. Customer Support Platform - Ticket Triage (Priority, Sentiment, Auto-Reply)
app.post('/api/support/ticket-triage', async (req: Request, res: Response) => {
  const { ticketSubject, customerMessage, customerTier } = req.body;

  const systemInstruction = `You are BuiltAura AI Ticket Triage Engine.
Analyze support ticket:
Subject: "${ticketSubject || 'System Issue'}"
Message: "${customerMessage || 'Experiencing unexpected behavior.'}"
Customer Tier: ${customerTier || 'Enterprise Gold'}

Provide structured analysis:
1. Detected Sentiment: [Frustrated, Neutral, Satisfied, Aggrieved] (Score -100% to +100%)
2. Calculated Priority: [Low, Medium, High, Urgent Critical]
3. Recommended SLA Target: [e.g., 15 minutes FRT]
4. Drafted Automated Reply Message
5. Escalation Rule Triggered: [Yes / No and why]`;

  const triageResult = await runGeminiTask(systemInstruction, `Subject: ${ticketSubject}, Message: ${customerMessage}`);

  res.json({
    success: true,
    triageResult,
    timestamp: new Date().toISOString(),
  });
});

// 21. Customer Support Platform - AI Knowledge Base Article Generator
app.post('/api/support/knowledge-generator', async (req: Request, res: Response) => {
  const { topic, category, targetAudience } = req.body;

  const systemInstruction = `You are BuiltAura AI Technical Writer.
Generate a comprehensive, easy-to-read Knowledge Base Help Center Article.
Topic: "${topic || 'How to configure OAuth 2.0 Single Sign-On'}"
Category: "${category || 'Security & Authentication'}"
Audience: "${targetAudience || 'Developers & IT Admins'}"

Structure:
# Article Title
## Overview
## Step-by-Step Instructions (1, 2, 3...)
## Common Troubleshooting Tips
## Related Articles`;

  const articleContent = await runGeminiTask(systemInstruction, `Topic: ${topic}, Category: ${category}`);

  res.json({
    success: true,
    topic,
    category,
    articleContent,
    timestamp: new Date().toISOString(),
  });
});

// 22. Operations Management System - AI Smart Scheduling Engine
app.post('/api/operations/ai-schedule', async (req: Request, res: Response) => {
  const { projectName, tasks, teamMembers, targetDeadline } = req.body;

  const systemInstruction = `You are BuiltAura AI Operations Smart Scheduler.
Project: "${projectName || 'Enterprise Operations Launch'}"
Target Completion: "${targetDeadline || '30 Days'}"
Tasks: ${JSON.stringify(tasks || [])}
Team: ${JSON.stringify(teamMembers || [])}

Perform intelligent operational scheduling:
1. 🎯 Critical Path Identification: Highlight dependent tasks on the longest sequence path.
2. 📅 Optimized Task Timeline Schedule: For each task, suggest Start Day, Due Day, and Estimated Hours.
3. ⚡ Bottleneck & Parallelization Recommendations: Suggest tasks that can run in parallel.
4. 🏁 Target Completion Realism Assessment: Percentage likelihood of completing on target deadline.

Format in clear markdown sections with concise actionable recommendations.`;

  const scheduleReport = await runGeminiTask(systemInstruction, `Schedule optimization for ${projectName}`);

  res.json({
    success: true,
    projectName,
    scheduleReport,
    timestamp: new Date().toISOString(),
  });
});

// 23. Operations Management System - AI Resource Allocation Engine
app.post('/api/operations/ai-resource-allocation', async (req: Request, res: Response) => {
  const { teamMembers, unassignedTasks, activeProjects } = req.body;

  const systemInstruction = `You are BuiltAura Operations AI Resource Planner.
Team Members & Current Workload: ${JSON.stringify(teamMembers || [])}
Unassigned Tasks: ${JSON.stringify(unassignedTasks || [])}

Tasks:
1. Analyze workload capacity (prevent burnout >85% capacity).
2. Match task skills with employee expertise.
3. Output optimal Task-to-Resource Assignment Matrix.
4. Provide Capacity Rebalancing Suggestions (e.g. reassigning 2 tasks from over-allocated engineers).`;

  const allocationReport = await runGeminiTask(systemInstruction, `Resource allocation for team`);

  res.json({
    success: true,
    allocationReport,
    timestamp: new Date().toISOString(),
  });
});

// 24. Operations Management System - AI Project Risk Prediction Engine
app.post('/api/operations/ai-risk-prediction', async (req: Request, res: Response) => {
  const { projectData, tasks, budgetUsage, timelineStatus } = req.body;

  const systemInstruction = `You are BuiltAura Operations AI Risk Analyst.
Project Details: ${JSON.stringify(projectData || {})}
Budget Usage: ${budgetUsage || '72%'}
Timeline Status: ${timelineStatus || '2 days delayed'}
Tasks Overview: ${JSON.stringify(tasks || [])}

Provide detailed predictive risk assessment:
1. 🛡️ Predicted Overall Risk Score: (Low, Medium, High, Critical)
2. 🚨 Primary Identified Risk Factors: (Schedule Slippage, Budget Overrun, Resource Bottleneck, Scope Creep)
3. 📉 Probability & Severity Matrix (Impact 1-10, Likelihood 1-10)
4. 💡 Automated Mitigation Action Plan & Preventive Controls`;

  const riskPredictionReport = await runGeminiTask(systemInstruction, `Risk prediction analysis`);

  res.json({
    success: true,
    riskPredictionReport,
    timestamp: new Date().toISOString(),
  });
});

// 25. Website Development Management System - AI Wireframe Generator
app.post('/api/webdev/ai-wireframe', async (req: Request, res: Response) => {
  const { pageTitle, targetAudience, pageGoal, keySections, themeStyle } = req.body;

  const systemInstruction = `You are BuiltAura WebArchitect AI Wireframe & UI Design Generator.
Page Title: "${pageTitle || 'Landing Page'}"
Target Audience: "${targetAudience || 'Enterprise Customers'}"
Page Goal: "${pageGoal || 'Lead Generation & Conversions'}"
Requested Key Sections: ${JSON.stringify(keySections || ['Hero', 'Features', 'Testimonials', 'Pricing', 'CTA', 'Footer'])}
Theme Style: "${themeStyle || 'Modern Dark Technical'}"

Generate a complete, high-fidelity UI Wireframe Blueprint:
1. 📐 Layout Architecture & Grid Structure (Header, Hero layout, Column counts, Spacing hierarchy)
2. 🧩 Section-by-Section Wireframe Breakdown (Component names, visual placeholders, typography scale, CTA placement)
3. 🎨 Design System Tokens (Color Palette, Font Pairings, Border Radii, Motion Specs)
4. 📱 Responsive Layout Adaptation (Mobile stack vs Desktop grid)
5. ⚡ UX Conversion Strategy & Micro-Interactions

Format in crisp, structured markdown with visual ASCII diagrams or UI layout boxes.`;

  const wireframeSpec = await runGeminiTask(systemInstruction, `Wireframe generation for ${pageTitle}`);

  res.json({
    success: true,
    pageTitle,
    wireframeSpec,
    timestamp: new Date().toISOString(),
  });
});

// 26. Website Development Management System - Automatic Technical Documentation Generator
app.post('/api/webdev/ai-tech-docs', async (req: Request, res: Response) => {
  const { websiteName, techStack, apiEndpoints, cmsSchema, hostingProvider } = req.body;

  const systemInstruction = `You are BuiltAura AI Technical Documentation Architect.
Website/Project Name: "${websiteName || 'Aura Platform Portal'}"
Tech Stack: ${JSON.stringify(techStack || ['React 18', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Docker'])}
API Endpoints: ${JSON.stringify(apiEndpoints || ['/api/auth', '/api/cms/pages', '/api/seo/audit', '/api/analytics'])}
CMS Schema: ${JSON.stringify(cmsSchema || ['Pages', 'Posts', 'Authors', 'MediaAssets', 'SEOConfig'])}
Hosting Infrastructure: "${hostingProvider || 'Google Cloud Run + Cloudflare CDN'}"

Generate a complete, production-grade Technical Documentation Suite:
1. 🏗️ System Architecture Overview (Diagrammatic breakdown, data flow, client-server lifecycle)
2. 🔌 API Reference & Data Contracts (Endpoints, request/response JSON schemas, authentication)
3. 🗄️ Database Schema & CMS Content Models (Entity-relationship definitions, field types, indexes)
4. ⚛️ Component Hierarchy & Frontend Architecture (Tree structure, props, state management)
5. 🚀 CI/CD Pipeline & Deployment Operational Playbook (Build steps, rollback strategies, environment variables)`;

  const techDocs = await runGeminiTask(systemInstruction, `Technical documentation for ${websiteName}`);

  res.json({
    success: true,
    websiteName,
    techDocs,
    timestamp: new Date().toISOString(),
  });
});

// 27. Website Development Management System - Automatic Website Health Report
app.post('/api/webdev/ai-health-report', async (req: Request, res: Response) => {
  const { websiteUrl, lighthouseScores, seoMetrics, uptimeStats, gitCommit } = req.body;

  const systemInstruction = `You are BuiltAura Web Health & Performance Auditor AI.
Website URL: "${websiteUrl || 'https://auracorp.io'}"
Lighthouse Scores: ${JSON.stringify(lighthouseScores || { performance: 98, accessibility: 96, bestPractices: 100, seo: 95 })}
SEO & Backlinks: ${JSON.stringify(seoMetrics || { keywordRankings: 'Top 3', backlinks: 1420, indexStatus: 'Fully Indexed' })}
Uptime & Latency: ${JSON.stringify(uptimeStats || { uptime30Days: '99.99%', avgLatencyMs: 42, lastIncident: 'None' })}
Latest Git Release: "${gitCommit || 'v2.4.0 (sha: a9f8e7d)'}"

Generate a comprehensive Executive Website Health Summary Report:
1. 📊 Executive Health Score & Grade (A+ to F)
2. ⚡ Core Web Vitals Analysis (LCP, FID/INP, CLS optimization recommendations)
3. 🔍 SEO & Metadata Optimization Audit
4. 🛡️ Security, SSL, & Uptime Reliability Verification
5. 🛠️ Prioritized Action Items for Engineering & Content Teams`;

  const healthReport = await runGeminiTask(systemInstruction, `Health report for ${websiteUrl}`);

  res.json({
    success: true,
    websiteUrl,
    healthReport,
    timestamp: new Date().toISOString(),
  });
});

// 28. Software Development - AI Code Generator
app.post('/api/software/ai-code-generator', async (req: Request, res: Response) => {
  const { prompt, language, framework, designPattern } = req.body;

  const systemInstruction = `You are BuiltAura CodeArchitect AI - Senior Principal Engineer.
Target Programming Language: "${language || 'TypeScript'}"
Framework / Stack: "${framework || 'React 18 + Node.js'}"
Design Pattern / Architecture: "${designPattern || 'Clean Architecture / Functional'}"

User Request: "${prompt || 'Create a resilient Redis rate limiter middleware with sliding window token bucket'}"

Generate a production-ready code suite:
1. 🛠️ Complete Implementation Code with strict type annotations
2. 🧪 Comprehensive Unit Tests (Jest/Vitest/PyTest) covering edge cases & failure modes
3. 🔒 Security & Performance Analysis (Time complexity, memory allocation, attack vector mitigations)
4. 📖 Usage Example & Documentation

Provide code in clean, syntax-highlighted markdown codeblocks.`;

  const generatedCode = await runGeminiTask(systemInstruction, `Code generation: ${prompt}`);

  res.json({
    success: true,
    language,
    generatedCode,
    timestamp: new Date().toISOString(),
  });
});

// 29. Software Development - AI Pull Request Reviewer
app.post('/api/software/ai-pr-review', async (req: Request, res: Response) => {
  const { prTitle, prDescription, codeDiff } = req.body;

  const systemInstruction = `You are BuiltAura PR-Reviewer AI - Lead Code Reviewer.
PR Title: "${prTitle || 'feat(auth): add OAuth2 refresh token rotation & PKCE flow'}"
PR Description: "${prDescription || 'Implements OAuth2 PKCE authorization code grant with sliding refresh token rotation'}"
Code Diff / Code Snippet:
\`\`\`
${codeDiff || 'const token = jwt.sign(payload, secret);'}
\`\`\`

Perform a comprehensive Pull Request Code Review:
1. 🚦 PR Approval Verdict (APPROVE, REQUEST_CHANGES, COMMENT)
2. 🔒 Security Vulnerability & Memory Leak Audit (OWASP Top 10, JWT secret handling, SQLi)
3. ⚡ Performance & Scalability Impact (Complexity analysis, N+1 query checks)
4. 🧹 Clean Code & Readability Feedback with concrete code diff recommendations
5. 🧪 Test Coverage & Edge Case Verification`;

  const prReview = await runGeminiTask(systemInstruction, `PR review for ${prTitle}`);

  res.json({
    success: true,
    prTitle,
    prReview,
    timestamp: new Date().toISOString(),
  });
});

// 30. Software Development - AI Bug Detector & Stacktrace Analyzer
app.post('/api/software/ai-bug-detector', async (req: Request, res: Response) => {
  const { stackTrace, codeSnippet, environment } = req.body;

  const systemInstruction = `You are BuiltAura BugHunter AI - Senior Reliability Engineer.
Runtime Environment: "${environment || 'Production Kubernetes Pod'}"
Stack Trace / Error Log:
\`\`\`
${stackTrace || 'Error: UnhandledPromiseRejection: Cannot read properties of undefined (reading "id")'}
\`\`\`
Code Snippet:
\`\`\`
${codeSnippet || 'async function getUser(req) { const user = await db.find(req.params.id); return user.id; }'}
\`\`\`

Diagnose and fix the bug:
1. 🔍 Root Cause Analysis (Exact line failure, memory state, race condition or null pointer trigger)
2. 🛡️ Vulnerability Severity Assessment (Critical, Major, Moderate, Minor)
3. 🩹 Production Hotfix Patch Code (Fully corrected function with guard clauses and exception handling)
4. 🧪 Regression Test Case to prevent future recurrence`;

  const bugAnalysis = await runGeminiTask(systemInstruction, `Bug analysis for ${stackTrace?.slice(0, 50)}`);

  res.json({
    success: true,
    bugAnalysis,
    timestamp: new Date().toISOString(),
  });
});

// 31. Software Development - AI Developer Assistant Chat
app.post('/api/software/ai-assistant', async (req: Request, res: Response) => {
  const { query, context } = req.body;

  const systemInstruction = `You are BuiltAura AI Developer Assistant - expert in software architecture, algorithms, K8s, CI/CD, React, TypeScript, Go, Python, and cloud infrastructure.
Provide precise, actionable developer advice with clear code examples where applicable.
Context: ${JSON.stringify(context || { activeRepo: 'auracorp/aura-monorepo', branch: 'main' })}

User Query: "${query}"`;

  const responseText = await runGeminiTask(systemInstruction, `Dev assistant query: ${query}`);

  res.json({
    success: true,
    response: responseText,
    timestamp: new Date().toISOString(),
  });
});

// 32. Client Portal - AI Client Assistant
app.post('/api/client-portal/ai-assistant', async (req: Request, res: Response) => {
  const { query, clientName, projectContext } = req.body;

  const systemInstruction = `You are BuiltAura Client Success AI - dedicated client concierge and project navigator for client "${clientName || 'Acme Corp'}".
Context: ${JSON.stringify(projectContext || { activeProjects: 2, totalUnpaidInvoices: 1, pendingApprovals: 2 })}

User Query: "${query}"

Provide a warm, executive, helpful, and concise response addressing project milestones, invoice clarification, design feedback process, meeting scheduling, or contract terms.`;

  const responseText = await runGeminiTask(systemInstruction, `Client portal assistant query for ${clientName}`);

  res.json({
    success: true,
    response: responseText,
    timestamp: new Date().toISOString(),
  });
});

// 33. Client Portal - Online Payment Processor
app.post('/api/client-portal/process-payment', async (req: Request, res: Response) => {
  const { invoiceId, invoiceNumber, amount, paymentMethod, clientEmail } = req.body;

  // Simulate payment processing
  const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

  res.json({
    success: true,
    transactionId,
    invoiceId,
    invoiceNumber,
    amount,
    paymentMethod: paymentMethod || 'Credit Card (Visa ****4242)',
    status: 'Paid',
    receiptUrl: `/receipts/${transactionId}.pdf`,
    message: `Payment of $${amount?.toLocaleString() || '0'} for Invoice ${invoiceNumber} successfully processed!`,
    timestamp: new Date().toISOString(),
  });
});

// 34. Client Portal - Design Feedback & CSAT AI Analyzer
app.post('/api/client-portal/submit-feedback', async (req: Request, res: Response) => {
  const { feedbackText, rating, projectTitle, designName } = req.body;

  const systemInstruction = `You are BuiltAura Client Feedback AI Analyst.
Project: "${projectTitle || 'Enterprise Web Platform'}"
Design/Asset: "${designName || 'Homepage V2 Mockup'}"
Client Rating: ${rating || 5} / 5 stars
Feedback Text: "${feedbackText || 'Love the high-contrast typography and clean spacing! Can we make the hero call-to-action button slightly brighter emerald green?'}"

Analyze this client feedback:
1. 🎯 Sentiment Score (Positive, Neutral, Urgent Change)
2. 📋 Extracted Action Items & Design Tweaks for Design/Dev Team
3. 💬 Professional Auto-Generated Response back to Client acknowledging their request.`;

  const analysis = await runGeminiTask(systemInstruction, `Feedback analysis for ${projectTitle}`);

  res.json({
    success: true,
    rating,
    analysis,
    timestamp: new Date().toISOString(),
  });
});

// 35. Employee Portal - AI HR & Career Concierge
app.post('/api/employee-portal/ai-assistant', async (req: Request, res: Response) => {
  const { query, userName, userRole, department } = req.body;

  const systemInstruction = `You are BuiltAura Employee Experience & HR Concierge AI.
Employee: "${userName || 'Alex Morgan'}", Role: "${userRole || 'Senior Full-Stack Engineer'}", Department: "${department || 'Engineering'}".

User Query: "${query}"

Provide a friendly, supportive, clear, and action-oriented response addressing HR policies, PTO balances, payroll/tax questions, training recommendations, company benefits, or performance goals. Keep response concise (2-4 bullet points max).`;

  const responseText = await runGeminiTask(systemInstruction, `Employee portal AI query for ${userName}`);

  res.json({
    success: true,
    response: responseText,
    timestamp: new Date().toISOString(),
  });
});

// 36. Employee Portal - AI Performance Review Coach
app.post('/api/employee-portal/performance-coach', async (req: Request, res: Response) => {
  const { selfAppraisal, accomplishments, areaForGrowth, employeeName } = req.body;

  const systemInstruction = `You are BuiltAura Employee Performance & Career AI Coach.
Employee: "${employeeName || 'Alex Morgan'}"
Key Accomplishments: "${accomplishments || 'Delivered OAuth2 authentication module, improved API response latency by 45%, mentored 2 junior engineers.'}"
Area for Growth: "${areaForGrowth || 'Expand domain expertise in cloud infrastructure & microservices observability.'}"
Self Appraisal Notes: "${selfAppraisal || 'Consistently exceeded sprint velocity and maintained high code quality.'}"

Analyze and generate a professional performance self-appraisal summary:
1. 🚀 Strength Highlights & Key Business Impact
2. 🎯 Actionable Growth Goals for next review cycle
3. 💬 Encouraging Executive Feedback Summary.`;

  const responseText = await runGeminiTask(systemInstruction, `Performance review coaching for ${employeeName}`);

  res.json({
    success: true,
    coachingSummary: responseText,
    timestamp: new Date().toISOString(),
  });
});

// 37. Executive Assistant - Daily Briefing Generator
app.post('/api/executive-assistant/daily-briefing', async (req: Request, res: Response) => {
  const { executiveName, tenantName, date } = req.body;

  const systemInstruction = `You are BuiltAura Executive Assistant AI.
Generate a comprehensive, high-impact Morning Executive Daily Briefing for "${executiveName || 'Chief Executive Officer'}" at company "${tenantName || 'BuiltAura Corporation'}".
Date: "${date || 'Today'}"

Include these structured sections:
1. 🌅 Morning Executive Summary (2 sentences on today's overall outlook)
2. 📅 High-Priority Schedule & Key Meetings Today (3 key calendar highlights)
3. ✉️ Critical Email Alerts & Action Required (2 key inbox items)
4. 📈 Key Business Health Metrics (ARR, MRR, Active Customers, Agent Efficiency)
5. 🤖 Autonomous Agent Highlights (Key actions taken by Sales, Dev, and HR agents overnight)
6. 🎯 Today's Top 3 Strategic Objectives

Keep response polished, direct, executive-ready, and inspiring.`;

  const briefing = await runGeminiTask(systemInstruction, `Daily briefing for ${executiveName}`);

  res.json({
    success: true,
    briefing,
    timestamp: new Date().toISOString(),
  });
});

// 38. Executive Assistant - Document Summarizer & Key Takeaways
app.post('/api/executive-assistant/summarize-doc', async (req: Request, res: Response) => {
  const { documentTitle, documentText, focusArea } = req.body;

  const systemInstruction = `You are BuiltAura Executive Document Summarizer AI.
Document Title: "${documentTitle || 'Q3 Financial & Strategy Overview.pdf'}"
Focus Area: "${focusArea || 'General Executive Summary'}"
Content Text: "${documentText || 'The company achieved $2.4M ARR with 142% net retention. Operating expenses decreased 12% due to AI workflow automation. Key risk factor is cloud infrastructure latency in EU region.'}"

Generate a structured executive summary:
1. 📌 Executive Brief (3 bullet summary)
2. 🚀 Key Strategic Insights & Growth Opportunities
3. ⚠️ Risk Factors & Compliance Bottlenecks
4. 🎯 Recommended Immediate Action Items for Executive Team`;

  const summary = await runGeminiTask(systemInstruction, `Summarize doc ${documentTitle}`);

  res.json({
    success: true,
    summary,
    timestamp: new Date().toISOString(),
  });
});

// 39. Executive Assistant - Executive Report Generator
app.post('/api/executive-assistant/generate-report', async (req: Request, res: Response) => {
  const { reportType, timeframe, keyFocus } = req.body;

  const systemInstruction = `You are BuiltAura Executive Business Intelligence & Report AI.
Report Type: "${reportType || 'Cross-Department Health & Revenue'}"
Timeframe: "${timeframe || 'Q3 2026'}"
Key Focus: "${keyFocus || 'Profitability & Agent Productivity'}"

Generate an executive-level performance report:
1. 📊 Executive Overview & Key Benchmarks
2. 💰 Financial & Revenue Metrics Breakdown
3. ⚡ Operational Velocity & AI Agent Productivity Impact
4. 🔮 Forecast & Q4 Strategic Guidance`;

  const reportContent = await runGeminiTask(systemInstruction, `Generate report ${reportType}`);

  res.json({
    success: true,
    reportContent,
    timestamp: new Date().toISOString(),
  });
});

// 40. Executive Assistant - Strategic Business Improvement Recommendations
app.post('/api/executive-assistant/recommendations', async (req: Request, res: Response) => {
  const { departmentContext, goal } = req.body;

  const systemInstruction = `You are BuiltAura AI Business Improvement & Growth Strategy Advisor.
Department/Context: "${departmentContext || 'All Departments'}"
Strategic Goal: "${goal || 'Increase Profit Margin by 15% and reduce customer churn'}"

Provide 3 high-ROI, actionable business improvement recommendations:
For each recommendation, provide:
- Title & High-level concept
- Estimated Impact / Expected ROI
- Effort / Implementation Complexity
- Recommended AI Agent Delegation & Automated Action`;

  const recommendations = await runGeminiTask(systemInstruction, `Business improvement strategy`);

  res.json({
    success: true,
    recommendations,
    timestamp: new Date().toISOString(),
  });
});

// 41. Executive Assistant - Talk to Other AI Agents (Agent-to-Agent Collaboration)
app.post('/api/executive-assistant/talk-to-agents', async (req: Request, res: Response) => {
  const { targetAgents, queryPrompt } = req.body;

  const systemInstruction = `You are BuiltAura Executive Assistant AI orchestrating a Multi-Agent Advisory Roundtable.
Target Agents: [${(targetAgents || ['Sales Agent', 'Finance Agent', 'Dev Agent']).join(', ')}]
Executive Query: "${queryPrompt || 'How do we accelerate enterprise software deployment while keeping customer acquisition cost below $1,200?'}"

Synthesize a collaborative multi-agent discussion response:
Provide distinct responses/insights from each agent role, followed by an Executive Synthesis & Action Plan.`;

  const agentConsensus = await runGeminiTask(systemInstruction, `Agent-to-agent collaboration for ${queryPrompt}`);

  res.json({
    success: true,
    agentConsensus,
    timestamp: new Date().toISOString(),
  });
});

// 42. Executive Assistant - Natural Language Command Parser & Action Handler
app.post('/api/executive-assistant/nl-command', async (req: Request, res: Response) => {
  const { commandText, currentApprovalLevel } = req.body;

  const systemInstruction = `You are BuiltAura Natural Language Command Core AI.
Command Text: "${commandText || 'Schedule a meeting with VP of Sales tomorrow at 3pm to review pipeline'}"
Current Configured Approval Threshold: "${currentApprovalLevel || 'Medium Risk - Require Confirmation'}"

Analyze the user's natural language command:
1. 🎯 Parsed Intent & Target Action (e.g., Schedule Meeting, Send Email, Create Task, Generate Report)
2. 🛡️ Risk Assessment (Low, Medium, High, Critical)
3. ⚡ Execution Status (Whether auto-executed or queued for Executive Approval based on Approval Level)
4. 💬 Friendly Confirmation & Outcome Summary.`;

  const commandResult = await runGeminiTask(systemInstruction, `NL Command ${commandText}`);

  res.json({
    success: true,
    commandResult,
    timestamp: new Date().toISOString(),
  });
});

// 13. System Architecture Specification Endpoint
app.get('/api/system/architecture', (req: Request, res: Response) => {
  res.json({
    appName: 'BuiltAura AI',
    architecturePattern: 'Clean Architecture / Domain-Driven Design (DDD)',
    microservices: [
      { name: 'auth-rbac-service', language: 'Node.js / NestJS', port: 4001, purpose: 'OAuth, JWT, Tenant Isolation, Security Rules' },
      { name: 'ai-orchestrator', language: 'FastAPI / Python', port: 8000, purpose: 'Gemini 3.6 Flash Agent Routing & Workflow Engine' },
      { name: 'crm-pipeline-service', language: 'Node.js / Express', port: 4002, purpose: 'Deals, Contacts, Lead Scoring & Sales Automation' },
      { name: 'pgvector-rag-service', language: 'Python / pgvector', port: 8001, purpose: 'Semantic Search, Knowledge Base Embeddings' },
    ],
    databases: {
      relational: 'PostgreSQL 16 (Tenant Row-Level Security, Financial Ledger, Users, Accounts)',
      vector: 'pgvector extension (Document Chunk Embeddings & RAG Search)',
      document: 'MongoDB 7.0 (Unstructured Logs, Audit Trails, AI Conversations)',
      inMemory: 'Redis 7.2 (Distributed Locks, WebSocket Sub/Pub, Session Cache)',
    },
    cloudDeployment: {
      containerization: 'Docker multi-stage builds',
      orchestration: 'Kubernetes (EKS / GKE) with Horizontal Pod Autoscaler (HPA)',
      ingress: 'Cloudflare Zero Trust + Nginx Ingress Controller',
      ci_cd: 'GitHub Actions with Helm Chart deployment',
    },
  });
});

// 43. Business Intelligence - AI Trend & Anomaly Explanations Endpoint
app.post('/api/bi/ai-insights', async (req: Request, res: Response) => {
  const { chartCategory, selectedFilter, timeframe, chartData, customPrompt } = req.body;

  const systemInstruction = `You are BuiltAura Chief Data Officer & AI Business Intelligence Analyst.
Analyze the following dataset and metrics for the "${chartCategory || 'Overall Business Intelligence'}" dashboard.
Active Filters: Timeframe="${timeframe || 'Last 30 Days'}", Scope="${selectedFilter || 'Global Enterprise'}"
Custom Focus Query: "${customPrompt || 'Analyze trends, detect anomalies, and recommend executive actions.'}"

Provided Data Context:
${JSON.stringify(chartData || {}, null, 2)}

Provide a structured, executive-level Business Intelligence Analysis:
1. 📈 Key Metric Trends & Growth Drivers (Clear analysis of patterns, velocity, and positive momentum)
2. ⚠️ Anomaly Detection & Risk Outliers (Identify unexpected dips, spikes, standard deviation variances, or performance bottlenecks)
3. 💡 Root Cause Hypotheses (Data-driven explanation of why these anomalies or trends occurred)
4. 🎯 Recommended Strategic Action Plan (3 direct, high-impact tactical recommendations for leadership)

Keep tone objective, quantitative, highly professional, scannable, and actionable.`;

  const insights = await runGeminiTask(systemInstruction, `BI Insight for ${chartCategory}`);

  res.json({
    success: true,
    insights,
    timestamp: new Date().toISOString(),
  });
});

// ------------------- VITE SERVER INTEGRATION ------------------- //

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BuiltAura AI Backend listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
