import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, MapPin, Phone, Mail, Star, MessageSquare, Video, DollarSign, Book, Languages, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/utils/api';

export default function TutorProfile({ user }) {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [accessInfo, setAccessInfo] = useState({ has_message_access: false, has_contact_access: false, current_coins: 0 });

  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    loadTutorProfile();
    loadReviews();
    trackProfileView();
    if (user) {
      checkAccess();
      checkExistingReview();
    }
  }, [tutorId, user]);

  const loadTutorProfile = async () => {
    try {
      const response = await api.get(`/tutors/${tutorId}`);
      setTutor(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load tutor profile:', error);
      toast.error('Failed to load tutor profile');
      setLoading(false);
    }
  };

  const trackProfileView = async () => {
    try {
      await api.post(`/tutors/${tutorId}/view`);
    } catch (error) {
      // Silent fail - don't interrupt user experience
    }
  };

  const loadReviews = async () => {
    try {
      const response = await api.get(`/reviews/${tutorId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const checkExistingReview = async () => {
    try {
      const response = await api.get(`/reviews/check/${tutorId}`);
      if (response.data.has_review) {
        setExistingReview(response.data.review);
        setReviewData({
          rating: response.data.review.rating,
          comment: response.data.review.comment
        });
      }
    } catch (error) {
      console.error('Failed to check existing review:', error);
    }
  };

  const checkAccess = async () => {
    try {
      const response = await api.get(`/check-tutor-access/${tutorId}`);
      setAccessInfo(response.data);
    } catch (error) {
      console.error('Failed to check access:', error);
    }
  };

  const handleContactTutor = async () => {
    if (!user) {
      toast.error('Please login to contact tutors');
      navigate('/login');
      return;
    }

    if (user.coins < 100) {
      toast.error('Insufficient coins. You need 100 coins to contact this tutor.');
      return;
    }
    
    try {
      const response = await api.post('/wallet/spend', null, {
        params: { coins: 100, purpose: 'contact_tutor', target_id: tutorId }
      });
      
      toast.success('Contact information unlocked!');
      if (response.data.data) {
        toast.info(`Mobile: ${response.data.data.mobile}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to unlock contact');
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast.error('Please login to send messages');
      navigate('/login');
      return;
    }
    
    // Check if user has already paid to message this tutor
    if (!accessInfo.has_message_access && user.role !== 'tutor') {
      if (accessInfo.current_coins < 100) {
        toast.error('Insufficient coins. You need 100 coins to message this tutor.');
        navigate('/wallet');
        return;
      }
      // Coins will be deducted when the first message is sent
      toast.info('100 coins will be deducted when you send your first message to this tutor.');
    }
    
    navigate('/messages', { state: { recipientId: tutorId, recipientName: tutor?.name } });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    try {
      await api.post('/reviews', {
        tutor_id: tutorId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: '' });
      loadReviews();
      loadTutorProfile();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!tutor) {
    return <div className="min-h-screen flex items-center justify-center">Tutor not found</div>;
  }

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
            {user && (
              <Link to="/wallet">
                <Button data-testid="profile-wallet-btn" variant="outline" className="rounded-full flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold">{accessInfo.current_coins || user?.coins || 0}</span>
                </Button>
              </Link>
            )}
            <Link to="/tutors">
              <Button data-testid="profile-back-btn" variant="outline" className="rounded-full">
                Back to Browse
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Section */}
            <Card className="overflow-hidden">
              {/* Cover Image */}
              <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <CardContent className="pt-0 relative">
                <div className="flex items-start gap-6 -mt-12">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={tutor.profile_photo} alt={tutor.name} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      {tutor.name?.charAt(0) || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 pt-14">
                    <h1 className="text-3xl font-outfit font-bold mb-2">{tutor.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{tutor.location || 'Location not set'}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(tutor.average_rating || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{tutor.average_rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {tutor.teaches_online && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Online Classes</Badge>}
                      {tutor.teaches_at_home && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Home Tuition</Badge>}
                      {tutor.can_travel && <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Can Travel</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subjects & Classes */}
            {tutor.subjects && tutor.subjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5" />
                    Subjects & Classes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tutor.subjects.map((sub, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                        <span className="font-semibold">{sub.subject}</span>
                        <div className="flex gap-1">
                          {sub.classes?.map((cls, i) => (
                            <Badge key={i} variant="secondary">{cls}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {tutor.experience && tutor.experience.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tutor.experience.map((exp, idx) => (
                      <div key={idx}>
                        <h3 className="font-semibold">{exp.role}</h3>
                        <p className="text-sm text-muted-foreground">{exp.company_institute}</p>
                        <p className="text-sm text-muted-foreground">{exp.duration}</p>
                        {idx < tutor.experience.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Reviews ({reviews.length})
                  </CardTitle>
                  <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                    <DialogTrigger asChild>
                      <Button data-testid="write-review-btn" variant="outline" className="rounded-full">
                        Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Write a Review for {tutor.name}</DialogTitle>
                        <DialogDescription>Share your experience (minimum 20 characters)</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Rating *</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                data-testid={`rating-${star}-btn`}
                                onClick={() => setReviewData({ ...reviewData, rating: star })}
                                className={`text-3xl transition-colors ${
                                  star <= reviewData.rating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              >
                                ⭐
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {reviewData.rating === 1 && 'Poor'}
                            {reviewData.rating === 2 && 'Below Average'}
                            {reviewData.rating === 3 && 'Average'}
                            {reviewData.rating === 4 && 'Good'}
                            {reviewData.rating === 5 && 'Excellent'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Your Review * (Minimum 20 characters)</label>
                          <Textarea
                            data-testid="review-comment-input"
                            value={reviewData.comment}
                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                            placeholder="Share your experience with this tutor. What did you like? How did they help you? (Min 20 characters)"
                            rows={4}
                            minLength={20}
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {reviewData.comment?.length || 0} / 20 characters minimum
                          </p>
                        </div>
                        <Button 
                          data-testid="submit-review-btn" 
                          type="submit" 
                          className="w-full rounded-full"
                          disabled={!reviewData.comment || reviewData.comment.length < 20}
                        >
                          Submit Review
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{review.student_name}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <span key={i} className="text-yellow-500">⭐</span>
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && <p className="text-sm">{review.comment}</p>}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Contact & Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Tutor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  data-testid="message-tutor-btn"
                  onClick={handleSendMessage}
                  className="w-full rounded-full flex items-center gap-2"
                  variant="outline"
                >
                  <MessageSquare className="w-4 h-4" />
                  {accessInfo.has_message_access ? 'Message' : 'Message (100 coins)'}
                </Button>
                <Button
                  data-testid="unlock-phone-btn"
                  onClick={handleContactTutor}
                  className="w-full rounded-full flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
                  disabled={accessInfo.has_contact_access}
                >
                  <Phone className="w-4 h-4" />
                  {accessInfo.has_contact_access ? 'Phone Unlocked' : 'Unlock Phone (100 coins)'}
                </Button>
                {user && user.role !== 'tutor' && (
                  <p className="text-xs text-muted-foreground text-center">
                    Your balance: {accessInfo.current_coins} coins
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Fee Range</p>
                  <p className="font-semibold flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ₹{tutor.fee_min || 0} - ₹{tutor.fee_max || 0}/hr
                  </p>
                </div>
                <Separator />
                {tutor.languages && tutor.languages.length > 0 && (
                  <>
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Languages className="w-4 h-4" />
                        Languages
                      </p>
                      <p className="font-semibold">{tutor.languages.join(', ')}</p>
                    </div>
                    <Separator />
                  </>
                )}
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-semibold">{tutor.gender || 'Not specified'}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground">Works as</p>
                  <p className="font-semibold">{tutor.works_as || 'Professional Tutor'}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground">Homework Help</p>
                  <p className="font-semibold">{tutor.homework_help ? 'Yes' : 'No'}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground">Registered</p>
                  <p className="font-semibold">
                    {new Date(tutor.registered_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
