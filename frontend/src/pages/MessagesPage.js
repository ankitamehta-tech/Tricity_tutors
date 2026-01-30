import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GraduationCap, Send, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/utils/api';

export default function MessagesPage({ user }) {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(location.state?.recipientId || null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    // If navigated with a recipient, select that conversation
    if (location.state?.recipientId) {
      setSelectedUser(location.state.recipientId);
      loadThread(location.state.recipientId);
    }
  }, [location.state]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setLoading(false);
    }
  };

  const loadThread = async (partnerId) => {
    try {
      const response = await api.get(`/messages/thread/${partnerId}`);
      setSelectedConversation(response.data);
    } catch (error) {
      console.error('Failed to load thread:', error);
    }
  };

  const handleSelectConversation = async (partnerId) => {
    setSelectedUser(partnerId);
    await loadThread(partnerId);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    
    try {
      await api.post('/messages', {
        recipient_id: selectedUser,
        message: newMessage
      });
      setNewMessage('');
      toast.success('Message sent!');
      // Reload conversation and thread
      loadConversations();
      loadThread(selectedUser);
    } catch (error) {
      if (error.response?.status === 402) {
        toast.error(error.response?.data?.detail || 'Insufficient coins. Please purchase coins first.');
      } else {
        toast.error('Failed to send message');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-outfit font-bold">Tricity Tutors</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/wallet">
              <Button data-testid="messages-wallet-btn" variant="outline" className="rounded-full flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold">{user?.coins || 0}</span>
              </Button>
            </Link>
            <Link to={user?.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'}>
              <Button data-testid="messages-back-btn" variant="outline" className="rounded-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-outfit font-bold mb-8">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">Loading...</p>
                ) : conversations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">No messages yet</p>
                ) : (
                  conversations.map((convo) => (
                    <button
                      key={convo.partner_id}
                      data-testid={`conversation-${convo.partner_id}-btn`}
                      onClick={() => handleSelectConversation(convo.partner_id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedUser === convo.partner_id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{convo.partner_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold truncate">{convo.partner_name || 'Unknown'}</p>
                            {convo.unread_count > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                {convo.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-sm truncate opacity-75">
                            {convo.last_message}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Display */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedConversation?.partner
                  ? selectedConversation.partner.name
                  : 'Select a conversation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <div className="space-y-6">
                  {/* Messages */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedConversation.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            msg.sender_id === user.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-accent'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Send Message Form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Textarea
                      data-testid="message-input"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="flex-1"
                    />
                    <Button data-testid="send-message-btn" type="submit" className="rounded-full">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  Select a conversation to view messages
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
