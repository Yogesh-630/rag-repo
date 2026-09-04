import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell/AppShell';
import ChatInterface from '../../components/ChatInterface/ChatInterface';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import { useChatStore } from '../../store/chatStore';

export default function ChatThreadPage() {
  const router = useRouter();
  const { id } = router.query;
  const { selectConversation, fetchConversations } = useChatStore();

  useEffect(() => {
    fetchConversations();
    if (id) {
      selectConversation(id);
    }
  }, [id, selectConversation, fetchConversations]);

  return (
    <ProtectedRoute>
      <Head>
        <title>Conversation Thread - CollegeRAG_AI</title>
      </Head>
      <AppShell title="Conversation History" subtitle={`Thread ID: ${id || 'Loading...'}`}>
        <ChatInterface />
      </AppShell>
    </ProtectedRoute>
  );
}
