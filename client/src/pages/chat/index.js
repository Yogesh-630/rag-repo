import React, { useEffect } from 'react';
import Head from 'next/head';
import AppShell from '../../components/AppShell/AppShell';
import ChatInterface from '../../components/ChatInterface/ChatInterface';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import { useChatStore } from '../../store/chatStore';

export default function ChatPage() {
  const { fetchConversations } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <ProtectedRoute>
      <Head>
        <title>RAG Assistant - CollegeRAG_AI</title>
      </Head>
      <AppShell title="AI College Information Assistant" subtitle="Institutional Knowledge RAG Pipeline">
        <ChatInterface />
      </AppShell>
    </ProtectedRoute>
  );
}
