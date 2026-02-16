import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlanCard from '../components/PlanCard';
import Modal from '../components/Modal';
import { plansAPI } from '../services/api';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function MyPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await plansAPI.getAll();
      setPlans(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await plansAPI.delete(deleteId);
      setPlans(plans.filter((p) => (p._id || p.id) !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err.message || 'Failed to delete plan');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Plans
          </h1>
          <p className="text-gray-500 mt-1">
            {plans.length} study plan{plans.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        <Link
          to="/create-plan"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4A6FA5] text-white text-sm font-semibold rounded-xl hover:bg-[#3F5F92] transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          New Plan
        </Link>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#4A6FA5] animate-spin" />
          <span className="ml-3 text-gray-500">Loading plans…</span>
        </div>

      ) : error ? (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>

          <button
            onClick={fetchPlans}
            className="text-[#4A6FA5] font-medium hover:underline"
          >
            Try again
          </button>
        </div>

      ) : plans.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg mb-4">
            No study plans yet.
          </p>

          <Link
            to="/create-plan"
            className="text-[#4A6FA5] font-medium hover:underline"
          >
            Create your first plan →
          </Link>
        </div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id || plan.id}
              plan={plan}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Plan"
      >
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this plan? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteId(null)}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>

    </div>
  );
}
