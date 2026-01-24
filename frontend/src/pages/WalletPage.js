import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Coins, ArrowUp, ArrowDown, CreditCard, Wallet as WalletIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/utils/api';

export default function WalletPage({ user, setUser }) {
  const [walletData, setWalletData] = useState({ coins: 0, transactions: [] });
  const [loading, setLoading] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [processingPackage, setProcessingPackage] = useState(null);

  const coinPackages = [
    { coins: 50, price: 100 },
    { coins: 100, price: 200 },
    { coins: 250, price: 500 },
    { coins: 500, price: 950 },
    { coins: 1000, price: 1800 },
    { coins: 2500, price: 4000 },
    { coins: 5000, price: 7500 },
    { coins: 7500, price: 10000 },
    { coins: 10000, price: 12000 },
  ];

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const response = await api.get('/wallet');
      setWalletData(response.data);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const handlePurchase = async (pkg) => {
    setLoading(true);
    try {
      const response = await api.post('/wallet/purchase', { package: pkg.coins });
      
      if (response.data.order_id) {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || response.data.key_id,
          amount: response.data.amount,
          currency: response.data.currency,
          order_id: response.data.order_id,
          name: 'Tricity Tutors',
          description: `Purchase ${pkg.coins} Coins`,
          image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200',
          handler: async function (razorpayResponse) {
            try {
              await api.post('/wallet/verify-payment', {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                transaction_id: response.data.transaction_id
              });
              
              toast.success(`Successfully purchased ${pkg.coins} coins!`);
              
              const updatedUser = { ...user, coins: user.coins + pkg.coins };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              setShowPurchaseModal(false);
              loadWallet();
            } catch (error) {
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
          },
          theme: {
            color: '#4F46E5'
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              toast.info('Payment cancelled');
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        toast.success(`Successfully purchased ${pkg.coins} coins! (Mock Mode)`);
        
        const updatedUser = { ...user, coins: user.coins + pkg.coins };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setShowPurchaseModal(false);
        loadWallet();
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
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
          <Link to={user?.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'}>
            <Button data-testid="back-dashboard-btn" variant="outline" className="rounded-full">
              Back to Dashboard
            </Button>
          </Link>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-outfit font-bold mb-2">Coin Wallet</h1>
          <p className="text-muted-foreground">Manage your coins and transactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Balance */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <WalletIcon className="w-6 h-6" />
                  Your Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold mb-6">{walletData.coins}</div>
                <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
                  <DialogTrigger asChild>
                    <Button data-testid="buy-coins-btn" className="w-full bg-white text-orange-600 hover:bg-gray-100 rounded-full font-semibold">
                      <Coins className="w-4 h-4 mr-2" />
                      Buy Coins
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Buy Coin Packages</DialogTitle>
                      <DialogDescription>
                        {process.env.REACT_APP_RAZORPAY_KEY_ID?.includes('PLACEHOLDER') 
                          ? 'Mock Payment Mode - Real payment integration ready (update Razorpay keys)' 
                          : 'Secure payment via Razorpay - UPI, Cards, Net Banking, Wallets'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {coinPackages.map((pkg, idx) => (
                        <Card key={idx} className="hover:border-yellow-500 transition-all">
                          <CardContent className="p-6 text-center">
                            <div className="text-3xl font-bold text-yellow-600 mb-2">{pkg.coins}</div>
                            <div className="text-sm text-muted-foreground mb-4">Coins</div>
                            <div className="text-2xl font-semibold mb-4">₹{pkg.price}</div>
                            <Button
                              data-testid={`buy-${pkg.coins}-coins-btn`}
                              className="w-full bg-yellow-500 hover:bg-yellow-600 rounded-full"
                              disabled={loading}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!loading) handlePurchase(pkg);
                              }}
                            >
                              {loading ? 'Processing...' : 'Buy Now'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {process.env.REACT_APP_RAZORPAY_KEY_ID?.includes('PLACEHOLDER') ? (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2">
                          <strong>Mock Payment Mode:</strong> Payments are currently in test mode.
                        </p>
                        <p className="text-xs text-blue-700">
                          To enable real payments, update RAZORPAY_KEY_ID in backend/.env and REACT_APP_RAZORPAY_KEY_ID in frontend/.env with your actual Razorpay keys.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 mb-2">
                          <strong>Secure Payment:</strong> Powered by Razorpay
                        </p>
                        <p className="text-xs text-green-700">
                          Accepts UPI, Credit/Debit Cards, Net Banking, and Wallets
                        </p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">How Coins Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {user?.role === 'tutor' ? (
                  <>
                    <div className="flex items-start gap-2">
                      <Coins className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">View Student Requirements</p>
                        <p className="text-muted-foreground">Costs 200 coins per requirement</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Purchase Packages</p>
                        <p className="text-muted-foreground">Buy coins at discounted rates</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <Coins className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Contact Tutors</p>
                        <p className="text-muted-foreground">Costs 100 coins per tutor</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CreditCard className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold">Post Requirements</p>
                        <p className="text-muted-foreground">Completely free!</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {walletData.transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                  ) : (
                    walletData.transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {txn.type === 'purchase' ? (
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <ArrowUp className="w-5 h-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <ArrowDown className="w-5 h-5 text-red-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">
                              {txn.type === 'purchase' ? 'Coins Purchased' : txn.purpose?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(txn.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${txn.type === 'purchase' ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.type === 'purchase' ? '+' : ''}{txn.coins}
                          </div>
                          {txn.amount && (
                            <div className="text-sm text-muted-foreground">₹{txn.amount}</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
