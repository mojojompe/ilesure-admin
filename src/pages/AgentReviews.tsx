import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff, Loader, Search, Star } from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { adminApi } from '../api/admin';
import toast from 'react-hot-toast';

export function AgentReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminApi.agents?.getReviews?.() ?? { success: false, data: null };
      if (res.success && res.data) {
        setReviews(res.data);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setUpdating(true);
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      await adminApi.agents?.updateReviewStatus?.(id, newStatus);
      toast.success(`Review is now ${newStatus}`);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error?.message || `Failed to update review status`);
    } finally {
      setUpdating(false);
    }
  };

  const filtered = reviews.filter(r =>
    r.agentId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.reviewerId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Reviews</h1>
          <p className="text-gray-500">Monitor and moderate agent feedback</p>
        </div>
      </div>

      <ClayCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by agent, reviewer, or comment..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Loader className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Loading reviews...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-4 font-semibold text-gray-600 pl-4">Agent</th>
                  <th className="pb-4 font-semibold text-gray-600">Reviewer</th>
                  <th className="pb-4 font-semibold text-gray-600">Rating</th>
                  <th className="pb-4 font-semibold text-gray-600">Comment</th>
                  <th className="pb-4 font-semibold text-gray-600">Status</th>
                  <th className="pb-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((review) => (
                  <tr key={review._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pl-4">
                      <p className="font-medium text-gray-900">{review.agentId?.fullName || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{review.agentId?.role || 'Agent'}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-gray-900">{review.reviewerId?.fullName || 'Unknown'}</p>
                      {review.hasBooked && <span className="text-xs text-primary font-medium">Verified Student</span>}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{review.rating}</span>
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate" title={review.comment}>
                        {review.comment}
                      </p>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={review.status === 'active' ? 'active' : 'inactive'} />
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        {review.status === 'active' ? (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleToggleStatus(review._id, 'active')}
                            disabled={updating}
                            title="Hide Review"
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleToggleStatus(review._id, 'hidden')}
                            disabled={updating}
                            title="Show Review"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ClayCard>
    </div>
  );
}
