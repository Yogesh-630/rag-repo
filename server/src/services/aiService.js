const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

/**
 * Generate answer from OpenAI gpt-4o-mini
 */
const generateOpenAIAnswer = async (prompt, systemPrompt, onToken) => {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    stream: true,
  });

  let fullText = '';
  let tokenCount = 0;

  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullText += content;
      tokenCount++;
      if (onToken) onToken(content);
    }
  }

  return {
    text: fullText,
    provider: 'openai-gpt-4o-mini',
    tokens: {
      promptTokens: Math.round((systemPrompt.length + prompt.length) / 4),
      completionTokens: tokenCount,
      totalTokens: Math.round((systemPrompt.length + prompt.length) / 4) + tokenCount,
    },
  };
};

/**
 * Generate answer from Google Gemini
 */
const generateGeminiAnswer = async (prompt, systemPrompt, onToken) => {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContentStream(prompt);
  let fullText = '';
  let tokenCount = 0;

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    if (chunkText) {
      fullText += chunkText;
      tokenCount += Math.round(chunkText.length / 4);
      if (onToken) onToken(chunkText);
    }
  }

  return {
    text: fullText,
    provider: 'google-gemini-1.5-flash',
    tokens: {
      promptTokens: Math.round((systemPrompt.length + prompt.length) / 4),
      completionTokens: tokenCount,
      totalTokens: Math.round((systemPrompt.length + prompt.length) / 4) + tokenCount,
    },
  };
};

/**
 * Resilient deterministic synthesis fallback for local evaluation
 */
const generateDeterministicAnswer = async (prompt, systemPrompt, contextChunks, onToken) => {
  // Synthesize answer by extracting key sentences and summarizing the context chunks
  const paragraphs = contextChunks.map(c => c.content);
  let synthesized = `Based on the official institutional records from **${contextChunks[0].fileName}** (Page ${contextChunks[0].pageNumber}):\n\n`;

  // Extract core facts
  const facts = [];
  for (const chunk of contextChunks) {
    const lines = chunk.content.split('\n').filter(l => l.trim().length > 15);
    for (const line of lines.slice(0, 3)) {
      if (!facts.includes(line.trim())) {
        facts.push(line.trim());
      }
    }
  }

  if (facts.length > 0) {
    synthesized += facts.map(f => `• ${f}`).join('\n\n') + '\n\n';
  } else {
    synthesized += paragraphs.join('\n\n') + '\n\n';
  }

  synthesized += `\n*Source: ${contextChunks.map(c => `[${c.fileName}, Page ${c.pageNumber}]`).join(', ')}*`;

  // Simulate smooth streaming tokens
  const words = synthesized.split(' ');
  for (let i = 0; i < words.length; i++) {
    const piece = (i === 0 ? '' : ' ') + words[i];
    if (onToken) onToken(piece);
    await new Promise(r => setTimeout(r, 12));
  }

  return {
    text: synthesized,
    provider: 'collegerag-synthesis-engine',
    tokens: {
      promptTokens: Math.round((systemPrompt.length + prompt.length) / 4),
      completionTokens: Math.round(synthesized.length / 4),
      totalTokens: Math.round((systemPrompt.length + prompt.length + synthesized.length) / 4),
    },
  };
};

module.exports = {
  generateOpenAIAnswer,
  generateGeminiAnswer,
  generateDeterministicAnswer,
};
