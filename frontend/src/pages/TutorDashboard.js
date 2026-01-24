import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  GraduationCap, Coins, Briefcase, MessageSquare, Bell, Video, LogOut, 
  Eye, Send, Star, Users, Camera, Clock, MapPin, User, ChevronRight,
  Wallet, FileText, X, Upload, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { api, logout } from '@/utils/api';

// Helper function to format date in IST
const formatDateIST = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateIST(dateString);
};

export default function TutorDashboard({ user, setUser }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ profile_views: 0, applications: 0, rating: 0, coins: 0 });
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [requirements, setRequirements] = useState([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoInputUrl, setPhotoInputUrl] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadProfile();
    loadStats();
    loadMessages();
    loadConversations();
    loadRequirements();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  const loadProfile = async () => {
    try {
      const response = await api.get('/tutor/profile');
      setProfile(response.data);
      setPhotoUrl(response.data.profile_photo || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/tutor/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const [messagesRes, unreadRes] = await Promise.all([
        api.get('/messages'),
        api.get('/messages/unread')
      ]);
      setMessages(messagesRes.data);
      setUnreadCount(unreadRes.data.count);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadRequirements = async () => {
    try {
      const response = await api.get('/requirements');
      setRequirements(response.data.slice(0, 10));
    } catch (error) {
      console.error('Failed to load requirements:', error);
    }
  };

  const loadConversationThread = async (partnerId, partnerName) => {
    try {
      const response = await api.get(`/messages/thread/${partnerId}`);
      setConversationMessages(response.data.messages);
      setSelectedConversation({ id: partnerId, name: partnerName });
      loadConversations(); // Refresh unread counts
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      await api.post('/messages', {
        recipient_id: selectedConversation.id,
        message: newMessage
      });
      setNewMessage('');
      loadConversationThread(selectedConversation.id, selectedConversation.name);
      toast.success('Message sent!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send message');
    }
  };

  const updateProfilePhoto = async () => {
    if (!photoUrl.trim()) {
      toast.error('Please enter a photo URL');
      return;
    }
    
    try {
      await api.post(`/tutor/profile/photo?photo_url=${encodeURIComponent(photoUrl)}`);
      toast.success('Profile photo updated!');
      loadProfile();
    } catch (error) {
      toast.error('Failed to update photo');
    }
  };

  const handleViewRequirement = async (reqId) => {
    if (user.coins < 200) {
      toast.error('Insufficient coins. You need 200 coins to view this requirement.');
      return;
    }
    
    try {
      const response = await api.post('/wallet/spend', null, {
        params: { coins: 200, purpose: 'view_requirement', target_id: reqId }
      });
      
      toast.success('Requirement unlocked!');
      const updatedUser = { ...user, coins: response.data.remaining_coins };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      loadStats();
      
      toast.info(`Contact: ${response.data.data.phone}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to unlock requirement');
    }
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <div>
              <span className="text-xl font-bold text-gray-900">Tricity Tutors</span>
              <span className="text-xs text-gray-500 block">Chandigarh Region</span>
            </div>
          </Link>
          
          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'jobs' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Find Students
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all relative ${
                activeTab === 'messages' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Messages
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/wallet">
              <Button variant="outline" className="rounded-full flex items-center gap-2 border-yellow-300 bg-yellow-50">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-700">{user?.coins || 0}</span>
              </Button>
            </Link>
            <Button variant="outline" className="rounded-full relative" onClick={() => setActiveTab('messages')}>
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button onClick={logout} variant="outline" className="rounded-full">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile.name?.split(' ')[0]}!</h1>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Last login: {formatDateIST(profile.last_login || new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">Profile Views</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.profile_views || 0}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Send className="w-4 h-4" />
                    <span className="text-xs">Applications</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.applications || 0}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Star className="w-4 h-4" />
                    <span className="text-xs">Rating</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.rating?.toFixed(1) || '0.0'}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Coins className="w-4 h-4" />
                    <span className="text-xs">Coins</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.coins || user?.coins || 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Introduction Video Section */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Video className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Introduction Video</CardTitle>
                        <p className="text-sm text-gray-500">Add a YouTube video to introduce yourself</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Video Guidelines
                      </h4>
                      <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                        <li>Keep your video between 1-3 minutes</li>
                        <li>Introduce yourself and your teaching experience</li>
                        <li>Mention subjects you teach and your teaching style</li>
                        <li>Ensure good lighting and clear audio</li>
                        <li>Upload to YouTube and paste the URL below</li>
                      </ul>
                    </div>
                    
                    <div>
                      <Label className="text-gray-700">YouTube Video URL</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={profile.intro_video_url || ''}
                          placeholder="https://youtube.com/watch?v=..."
                          className="flex-1"
                          onChange={(e) => setProfile({ ...profile, intro_video_url: e.target.value })}
                        />
                        <Button 
                          onClick={async () => {
                            try {
                              await api.put('/tutor/profile', { intro_video_url: profile.intro_video_url });
                              toast.success('Video URL saved!');
                            } catch (error) {
                              toast.error('Failed to save video URL');
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                    
                    {profile.intro_video_url && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <iframe
                          width="100%"
                          height="100%"
                          src={profile.intro_video_url.replace('watch?v=', 'embed/')}
                          title="Intro Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Jobs */}
                <Card className="bg-white border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-green-600" />
                        </div>
                        <CardTitle className="text-lg">Recent Job Postings</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('jobs')}>
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {requirements.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No job requirements available</p>
                    ) : (
                      <div className="space-y-3">
                        {requirements.slice(0, 3).map((req) => (
                          <div key={req.id} className="p-4 border rounded-lg hover:border-indigo-300 transition-colors bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{req.subject}</h3>
                                <p className="text-sm text-gray-500">{req.level_class} • {req.mode}</p>
                              </div>
                              <Badge variant="secondary">{req.requirement_type}</Badge>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {req.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatRelativeTime(req.created_at)}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleViewRequirement(req.id)}
                                className="rounded-full text-xs h-8"
                              >
                                Unlock (200 coins)
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'jobs' && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    All Student Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requirements.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No job requirements available</p>
                    ) : (
                      requirements.map((req) => (
                        <div key={req.id} className="p-4 border rounded-lg hover:border-indigo-300 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{req.subject}</h3>
                              <p className="text-sm text-gray-500">{req.level_class} • {req.mode}</p>
                            </div>
                            <Badge>{req.time_preference}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{req.description || 'No description provided'}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {req.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDateIST(req.created_at)}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleViewRequirement(req.id)}
                              className="rounded-full"
                            >
                              Unlock Contact (200 coins)
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'messages' && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
                    {/* Conversation List */}
                    <div className="border-r">
                      {conversations.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No conversations yet</p>
                          <p className="text-xs mt-1">Messages from students will appear here</p>
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <div
                            key={conv.partner_id}
                            onClick={() => loadConversationThread(conv.partner_id, conv.partner_name)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedConversation?.id === conv.partner_id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                  {conv.partner_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-900 truncate">{conv.partner_name}</p>
                                  {conv.unread_count > 0 && (
                                    <Badge className="bg-red-500 text-xs">{conv.unread_count}</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                                <p className="text-xs text-gray-400">{formatRelativeTime(conv.last_message_time)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Message Thread */}
                    <div className="md:col-span-2 flex flex-col">
                      {selectedConversation ? (
                        <>
                          <div className="p-4 border-b bg-gray-50">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                  {selectedConversation.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{selectedConversation.name}</p>
                                <p className="text-xs text-gray-500">Student</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[350px]">
                            {conversationMessages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[70%] p-3 rounded-lg ${
                                  msg.sender_id === user.id 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  <p className="text-sm">{msg.message}</p>
                                  <p className={`text-xs mt-1 ${
                                    msg.sender_id === user.id ? 'text-indigo-200' : 'text-gray-400'
                                  }`}>
                                    {formatRelativeTime(msg.created_at)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                          
                          <div className="p-4 border-t bg-gray-50">
                            <div className="flex gap-2">
                              <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1"
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                              />
                              <Button onClick={sendMessage} className="bg-indigo-600 hover:bg-indigo-700">
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>Select a conversation to view messages</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'profile' && (
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Edit Profile</CardTitle>
                    <Link to="/tutor/profile/edit">
                      <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                        Complete Full Profile
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{profile.location || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{profile.gender || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fee Range</p>
                      <p className="font-medium">₹{profile.fee_min || 0} - ₹{profile.fee_max || 0}/hr</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Languages</p>
                      <p className="font-medium">{profile.languages?.join(', ') || 'Not set'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500">Subjects</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.subjects?.length > 0 ? (
                          profile.subjects.map((sub, idx) => (
                            <Badge key={idx} variant="secondary">{sub.subject || sub}</Badge>
                          ))
                        ) : (
                          <p className="text-gray-400">No subjects added</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Profile Card */}
          <div className="space-y-6">
            <Card className="bg-white border-0 shadow-sm overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600" />
              <CardContent className="pt-0 relative">
                {/* Profile Photo */}
                <div className="relative -mt-12 mb-4 flex justify-center">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage src={profile.profile_photo} />
                      <AvatarFallback className="text-2xl bg-indigo-100 text-indigo-600">
                        {profile.name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => {
                        setPhotoInputUrl(profile.profile_photo || '');
                        setShowPhotoModal(true);
                      }}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photo Upload Modal */}
                <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-indigo-600" />
                        Upload Profile Photo
                      </DialogTitle>
                      <DialogDescription>
                        Upload a photo from your device (Max 100KB, JPG/PNG/WebP)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Preview */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <Avatar className="w-32 h-32 border-4 border-gray-200">
                            <AvatarImage src={photoInputUrl} />
                            <AvatarFallback className="text-3xl bg-gray-100 text-gray-400">
                              {profile.name?.charAt(0) || 'T'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      
                      {/* File Upload */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Choose Photo</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                          <input
                            type="file"
                            id="photo-file-input"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              // Check file size (30KB max)
                              if (file.size > 30 * 1024) {
                                toast.error('File too large! Maximum size is 30KB. Please compress your image.');
                                return;
                              }
                              
                              // Check file type
                              if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
                                toast.error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
                                return;
                              }
                              
                              // Show preview
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setPhotoInputUrl(event.target.result);
                              };
                              reader.readAsDataURL(file);
                              
                              // Upload file
                              const formData = new FormData();
                              formData.append('file', file);
                              
                              try {
                                toast.loading('Uploading photo...', { id: 'photo-upload' });
                                const response = await api.post('/tutor/profile/photo/upload', formData, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                toast.success('Photo uploaded successfully!', { id: 'photo-upload' });
                                setShowPhotoModal(false);
                                loadProfile();
                              } catch (error) {
                                toast.error(error.response?.data?.detail || 'Failed to upload photo', { id: 'photo-upload' });
                              }
                            }}
                          />
                          <label htmlFor="photo-file-input" className="cursor-pointer">
                            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                            <p className="text-sm font-medium text-gray-700">
                              Click to upload from device
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG or WebP (Max 30KB)
                            </p>
                          </label>
                        </div>
                        
                        {/* Size Info */}
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Recommended: Square photo, at least 200x200 pixels</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-2 bg-white text-gray-500">OR enter URL</span>
                        </div>
                      </div>
                      
                      {/* URL Input (Alternative) */}
                      <div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="photo-url"
                              value={photoInputUrl.startsWith('data:') ? '' : photoInputUrl}
                              onChange={(e) => setPhotoInputUrl(e.target.value)}
                              placeholder="https://example.com/photo.jpg"
                              className="pl-10 text-sm"
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (!photoInputUrl.trim() || photoInputUrl.startsWith('data:')) {
                                toast.error('Please enter a valid URL');
                                return;
                              }
                              try {
                                await api.post(`/tutor/profile/photo?photo_url=${encodeURIComponent(photoInputUrl)}`);
                                toast.success('Photo updated!');
                                setShowPhotoModal(false);
                                loadProfile();
                              } catch (error) {
                                toast.error('Failed to update photo');
                              }
                            }}
                          >
                            Save URL
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowPhotoModal(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-sm text-gray-500">{profile.location || 'Location not set'}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(stats.rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">({stats.reviews_count || 0})</span>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Eye className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{stats.profile_views || 0}</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Send className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{stats.applications || 0}</p>
                    <p className="text-xs text-gray-500">Applications</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Coins className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
                    <p className="text-lg font-bold text-yellow-600">{stats.coins || 0}</p>
                    <p className="text-xs text-gray-500">Coins</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    onClick={() => setActiveTab('messages')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                    {unreadCount > 0 && (
                      <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
                    )}
                  </Button>
                  <Link to="/wallet" className="block">
                    <Button variant="outline" className="w-full rounded-lg">
                      <Wallet className="w-4 h-4 mr-2" />
                      Manage Wallet
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-lg"
                    onClick={() => setActiveTab('profile')}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    View Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">💡 Quick Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">•</span>
                    Complete your profile to get more visibility
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">•</span>
                    Add an intro video to increase trust
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600">•</span>
                    Respond to messages quickly for better ratings
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
