import { create } from 'zustand';
import api from '../services/api';
import { getSocket, joinExecutionRoom } from '../services/socket';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isQuerying: false,
  streamingMessage: '',
  activeExecutionId: null,
  activeExecutionLogs: [],
  selectedCitation: null,
  selectedCategory: 'All',
  selectedDepartment: 'All',
  promptSuggestions: [
    'What is the tuition fee for Computer Science per semester?',
    'What are the hostel curfew rules and mess timings?',
    'What is the mandatory exam attendance requirement?',
    'What are the key placement statistics and highest packages?',
    'What are the eligibility criteria and deadlines for 2025 admissions?',
  ],

  setCategory: (category) => set({ selectedCategory: category }),
  setDepartment: (department) => set({ selectedDepartment: department }),
  setSelectedCitation: (citation) => set({ selectedCitation: citation }),

  fetchConversations: async () => {
    try {
      const res = await api.get('/chat/conversations');
      set({ conversations: res.data.conversations || [] });
    } catch (err) {
      console.warn('Could not fetch conversations:', err.message);
    }
  },

  selectConversation: async (id) => {
    set({ activeConversationId: id, isQuerying: true, streamingMessage: '', activeExecutionLogs: [] });
    try {
      const res = await api.get(`/chat/conversations/${id}`);
      set({
        messages: res.data.conversation?.messages || [],
        isQuerying: false,
      });
    } catch (err) {
      console.error('Error fetching conversation:', err);
      set({ isQuerying: false });
    }
  },

  startNewChat: () => {
    set({
      activeConversationId: null,
      messages: [],
      streamingMessage: '',
      activeExecutionId: null,
      activeExecutionLogs: [],
    });
  },

  sendQuery: async (queryText) => {
    if (!queryText || !queryText.trim() || get().isQuerying) return;

    const userMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isQuerying: true,
      streamingMessage: '',
      activeExecutionLogs: [],
    }));

    // Setup Socket.IO listener for live execution steps and tokens
    const socket = getSocket();
    let currentExecId = null;

    const handleExecutionStep = (data) => {
      set((state) => ({
        activeExecutionLogs: [...state.activeExecutionLogs, data],
      }));
    };

    const handleStreamToken = (data) => {
      set((state) => ({
        streamingMessage: state.streamingMessage + data.token,
      }));
    };

    if (socket) {
      socket.on('execution_step', handleExecutionStep);
      socket.on('stream_token', handleStreamToken);
    }

    try {
      const res = await api.post('/chat/query', {
        query: queryText.trim(),
        conversationId: get().activeConversationId,
        category: get().selectedCategory,
        department: get().selectedDepartment,
      });

      const { response, citations, topSimilarityScore, executionId, conversationId } = res.data;

      const assistantMessage = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        content: response,
        citations: citations || [],
        score: topSimilarityScore || 0,
        executionId,
        feedback: 'none',
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        activeConversationId: conversationId || state.activeConversationId,
        activeExecutionId: executionId,
        isQuerying: false,
        streamingMessage: '',
      }));

      get().fetchConversations();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to generate answer';
      const errorAssistantMsg = {
        id: 'ast_err_' + Date.now(),
        role: 'assistant',
        content: `Error: ${errMsg}. Please verify the server connection and try again.`,
        citations: [],
        score: 0,
        feedback: 'none',
        timestamp: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, errorAssistantMsg],
        isQuerying: false,
        streamingMessage: '',
      }));
    } finally {
      if (socket) {
        socket.off('execution_step', handleExecutionStep);
        socket.off('stream_token', handleStreamToken);
      }
    }
  },

  submitMessageFeedback: async (messageId, executionId, feedbackType) => {
    try {
      // Optimistic update
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, feedback: feedbackType } : m
        ),
      }));

      await api.post('/chat/feedback', {
        messageId,
        executionId,
        conversationId: get().activeConversationId,
        feedback: feedbackType,
      });
    } catch (err) {
      console.warn('Feedback submit error:', err.message);
    }
  },
}));
