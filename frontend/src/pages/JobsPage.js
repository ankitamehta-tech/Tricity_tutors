import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GraduationCap, Briefcase, Search, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/utils/api';

export default function JobsPage({ user, setUser }) {
  const [allJobs, setAllJobs] = useState([]);
  const [onlineJobs, setOnlineJobs] = useState([]);
  const [myViewedJobs, setMyViewedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadJobs();
    loadMyViewedJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const [allResponse, onlineResponse] = await Promise.all([
        api.get('/requirements'),
        api.get('/requirements?mode=Online')
      ]);
      setAllJobs(allResponse.data);
      setOnlineJobs(onlineResponse.data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const loadMyViewedJobs = async () => {
    try {
      // Get transactions where user viewed requirements
      const walletResponse = await api.get('/wallet');
      const viewedTransactions = walletResponse.data.transactions.filter(
        t => t.purpose === 'view_requirement' && t.status === 'completed'
      );
      
      // Get the job details for viewed jobs
      const viewedJobIds = viewedTransactions.map(t => t.target_id).filter(Boolean);
      
      if (viewedJobIds.length > 0) {
        const allResponse = await api.get('/requirements');
        const viewedJobs = allResponse.data.filter(job => viewedJobIds.includes(job.id));
        setMyViewedJobs(viewedJobs);
      }
    } catch (error) {
      console.error('Failed to load viewed jobs:', error);
    }
  };

  const handleViewJob = async (jobId) => {
    if (user.coins < 200) {
      toast.error('Insufficient coins. You need 200 coins to view this job.');
      return;
    }
    
    try {
      const response = await api.post('/wallet/spend', null, {
        params: { coins: 200, purpose: 'view_requirement', target_id: jobId }
      });
      
      toast.success('Job details unlocked!');
      toast.info(`Contact: ${response.data.data.phone}`);
      
      // Update user coins
      if (setUser) {
        const updatedUser = { ...user, coins: response.data.remaining_coins };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      loadJobs();
      loadMyViewedJobs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to unlock job');
    }
  };

  const filteredJobs = (jobs) => {
    if (!searchQuery) return jobs;
    return jobs.filter(job => 
      job.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const isJobViewed = (jobId) => {
    return myViewedJobs.some(job => job.id === jobId);
  };

  const JobCard = ({ job, showContact = false }) => (
    <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{job.subject}</h3>
          <p className="text-sm text-muted-foreground">{job.level_class} • {job.mode}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{job.time_preference}</Badge>
          {isJobViewed(job.id) && <Badge variant="secondary" className="bg-green-100 text-green-800">Unlocked</Badge>}
        </div>
      </div>
      <p className="text-sm mb-3">{job.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{job.location}</span>
        {isJobViewed(job.id) ? (
          <div className="text-sm font-semibold text-green-600">
            📞 {job.phone}
          </div>
        ) : (
          <Button
            data-testid={`view-job-${job.id}-btn`}
            size="sm"
            onClick={() => handleViewJob(job.id)}
            className="rounded-full"
          >
            View Contact (200 coins)
          </Button>
        )}
      </div>
    </div>
  );

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
              <Button data-testid="jobs-wallet-btn" variant="outline" className="rounded-full flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold">{user?.coins || 0}</span>
              </Button>
            </Link>
            <Link to="/tutor/dashboard">
              <Button data-testid="jobs-back-btn" variant="outline" className="rounded-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-outfit font-bold mb-2 flex items-center gap-3">
            <Briefcase className="w-10 h-10 text-indigo-600" />
            Job Requirements
          </h1>
          <p className="text-muted-foreground">Find students looking for tutors in your subjects</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              data-testid="jobs-search-input"
              placeholder="Search by subject or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-full"
            />
          </div>
        </div>

        <Tabs defaultValue="my-jobs" className="space-y-8">
          <TabsList className="bg-white border shadow-sm p-1">
            <TabsTrigger data-testid="my-jobs-tab" value="my-jobs" className="rounded-lg">
              My Jobs ({myViewedJobs.length})
            </TabsTrigger>
            <TabsTrigger data-testid="all-jobs-tab" value="all" className="rounded-lg">
              Search All Jobs ({allJobs.length})
            </TabsTrigger>
            <TabsTrigger data-testid="online-jobs-tab" value="online" className="rounded-lg">
              Search Online Jobs ({onlineJobs.length})
            </TabsTrigger>
          </TabsList>

          {/* My Jobs Tab - Jobs the tutor has already viewed/unlocked */}
          <TabsContent value="my-jobs">
            <Card>
              <CardHeader>
                <CardTitle>My Unlocked Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myViewedJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">You haven&apos;t unlocked any jobs yet</p>
                      <p className="text-sm text-muted-foreground">
                        Browse &quot;Search All Jobs&quot; or &quot;Search Online Jobs&quot; to find and unlock student requirements
                      </p>
                    </div>
                  ) : (
                    filteredJobs(myViewedJobs).map((job) => <JobCard key={job.id} job={job} showContact={true} />)
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Jobs Tab */}
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Job Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredJobs(allJobs).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No jobs found</p>
                  ) : (
                    filteredJobs(allJobs).map((job) => <JobCard key={job.id} job={job} />)
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Online Jobs Tab */}
          <TabsContent value="online">
            <Card>
              <CardHeader>
                <CardTitle>Online Teaching Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredJobs(onlineJobs).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No online jobs found</p>
                  ) : (
                    filteredJobs(onlineJobs).map((job) => <JobCard key={job.id} job={job} />)
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
