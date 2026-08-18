import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, Link, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { safeUrl } from '../lib/safeUrl';
import { can, CAP } from '../lib/rbac';
import toast from 'react-hot-toast';

export function Ads() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAd, setNewAd] = useState({ imageUrl: '', link: '' });

  const canManage = can(CAP.ADS_MANAGE);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await adminApi.ads.list();
      if (res.success) {
        setAds(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAd(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAd = async () => {
    if (!newAd.imageUrl) {
      toast.error('Please upload an image for the ad.');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await adminApi.ads.create({ ...newAd, isActive: true });
      if (res.success) {
        toast.success('Ad created successfully');
        setShowAddModal(false);
        setNewAd({ imageUrl: '', link: '' });
        fetchAds();
      } else {
        toast.error(res.error?.message || 'Failed to create ad');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create ad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    try {
      const res = await adminApi.ads.delete(id);
      if (res.success) {
        toast.success('Ad deleted');
        fetchAds();
      } else {
        toast.error('Failed to delete ad');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete ad');
    }
  };

  const handleToggleStatus = async (ad: any) => {
    try {
      const res = await adminApi.ads.update(ad._id, { isActive: !ad.isActive });
      if (res.success) {
        toast.success(`Ad ${ad.isActive ? 'deactivated' : 'activated'}`);
        fetchAds();
      } else {
        toast.error('Failed to update ad status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update ad status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Ads Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage carousel ads for the home screens</p>
        </div>
        {/* SECURITY-FIX (AD-H3): creating ads is a privileged action — hidden for roles without ads.manage. */}
        {canManage && (
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Ad
          </Button>
        )}
      </div>

      <ClayCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary">Loading ads...</div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-pill bg-white shadow-clay-sm flex items-center justify-center mx-auto mb-4">
              <MegaphoneIcon className="w-8 h-8 text-text-tertiary" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">No Ads Found</h3>
            <p className="text-text-secondary mt-1">You haven't added any ads yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-clay-border bg-white/50">
                  <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Link</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Date Added</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clay-border">
                {ads.map((ad) => (
                  <tr key={ad._id} className="hover:bg-white/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-24 h-16 rounded-md overflow-hidden bg-clay-border-light flex items-center justify-center shadow-inner">
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-text-tertiary" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {/* SECURITY-FIX (AD-L2): only render a clickable link for safe http(s) URLs;
                          a stored javascript:/data: URL is shown as inert text, never as an href. */}
                      {(() => {
                        const href = safeUrl(ad.link);
                        if (href) {
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-mustard hover:underline">
                              <Link className="w-4 h-4" />
                              {ad.link.length > 30 ? ad.link.substring(0, 30) + '...' : ad.link}
                            </a>
                          );
                        }
                        return <span className="text-text-tertiary">{ad.link ? 'Invalid link' : 'No link provided'}</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(ad)}
                        disabled={!canManage}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-xs font-bold transition-colors ${
                          ad.isActive ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
                        } ${canManage ? '' : 'opacity-60 cursor-not-allowed'}`}
                      >
                        {ad.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">
                      {new Date(ad.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* SECURITY-FIX (AD-H3): deleting an ad is destructive — hidden without ads.manage. */}
                      {canManage ? (
                        <button
                          onClick={() => handleDeleteAd(ad._id)}
                          className="p-2 text-text-tertiary hover:text-status-error hover:bg-status-error/10 rounded-pill transition-colors"
                          title="Delete Ad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ClayCard>

      {/* Add Ad Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <ClayCard className="max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Add New Ad</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Ad Image *</label>
                <div 
                  className="w-full h-40 border-2 border-dashed border-clay-border rounded-xl flex flex-col items-center justify-center bg-white/50 hover:bg-white transition-colors cursor-pointer relative overflow-hidden"
                  onClick={() => document.getElementById('adImageUpload')?.click()}
                >
                  {newAd.imageUrl ? (
                    <img src={newAd.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-text-tertiary mb-2" />
                      <span className="text-sm font-medium text-text-secondary">Click to upload image</span>
                      <span className="text-xs text-text-tertiary mt-1">Recommended size: 800x400 (Base64)</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  id="adImageUpload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Redirect Link (Optional)</label>
                <input 
                  type="url"
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-clay-sm border-none bg-white shadow-inner-sm text-sm focus:ring-2 focus:ring-mustard outline-none transition-all"
                  value={newAd.link}
                  onChange={(e) => setNewAd(prev => ({ ...prev, link: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-clay-border">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleCreateAd}
                loading={isSubmitting}
              >
                Create Ad
              </Button>
            </div>
          </ClayCard>
        </div>
      )}
    </div>
  );
}

const MegaphoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 11 18-5v12L3 14v-3z"></path>
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
  </svg>
);
