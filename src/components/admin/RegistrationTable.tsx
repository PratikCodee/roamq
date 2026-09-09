import { useState } from 'react';
import { CheckCircle2, XCircle, Eye, Clock, Building2, User as UserIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { showToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { AppUser, AppBusiness, UserStatus } from '@/store/types';

type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'customers' | 'businesses';

const statusChip: Record<UserStatus, string> = {
  pending:  'bg-warning-100 text-warning-700 border-warning-200',
  approved: 'bg-success-100 text-success-700 border-success-200',
  rejected: 'bg-error-100 text-error-700 border-error-200',
};

export function RegistrationTable() {
  const { users, businesses, editUser, editBusiness, categories } = useAppData();
  const [filter, setFilter] = useState<FilterType>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | {
    type: 'approve' | 'reject';
    id: string;
    kind: 'user' | 'business';
    name: string;
  }>(null);
  const [bizCategory, setBizCategory] = useState<Record<string, string>>({});

  // Combine into unified list
  const allCustomers = users.filter((u) => u.role === 'customer');
  const allBusinesses = businesses;

  const filteredCustomers: Array<AppUser & { _kind: 'user' }> = allCustomers
    .filter((u) => {
      if (filter === 'businesses') return false;
      if (filter === 'pending') return u.status === 'pending';
      if (filter === 'approved') return u.status === 'approved';
      if (filter === 'rejected') return u.status === 'rejected';
      return true;
    })
    .map((u) => ({ ...u, _kind: 'user' as const }));

  const filteredBiz: Array<AppBusiness & { _kind: 'business' }> = allBusinesses
    .filter((b) => {
      if (filter === 'customers') return false;
      if (filter === 'pending') return b.status === 'pending';
      if (filter === 'approved') return b.status === 'approved';
      if (filter === 'rejected') return b.status === 'rejected';
      return true;
    })
    .map((b) => ({ ...b, _kind: 'business' as const }));

  const counts = {
    all:        allCustomers.length + allBusinesses.length,
    pending:    allCustomers.filter((u) => u.status === 'pending').length + allBusinesses.filter((b) => b.status === 'pending').length,
    approved:   allCustomers.filter((u) => u.status === 'approved').length + allBusinesses.filter((b) => b.status === 'approved').length,
    rejected:   allCustomers.filter((u) => u.status === 'rejected').length + allBusinesses.filter((b) => b.status === 'rejected').length,
    customers:  allCustomers.length,
    businesses: allBusinesses.length,
  };

  const FILTERS: Array<{ id: FilterType; label: string }> = [
    { id: 'all',        label: `All (${counts.all})` },
    { id: 'pending',    label: `Pending (${counts.pending})` },
    { id: 'approved',   label: `Approved (${counts.approved})` },
    { id: 'rejected',   label: `Rejected (${counts.rejected})` },
    { id: 'customers',  label: `Customers (${counts.customers})` },
    { id: 'businesses', label: `Businesses (${counts.businesses})` },
  ];

  const handleApprove = (id: string, kind: 'user' | 'business', name: string) => {
    setConfirmAction({ type: 'approve', id, kind, name });
  };
  const handleReject = (id: string, kind: 'user' | 'business', name: string) => {
    setConfirmAction({ type: 'reject', id, kind, name });
  };

  const doAction = () => {
    if (!confirmAction) return;
    const { type, id, kind } = confirmAction;
    const status: UserStatus = type === 'approve' ? 'approved' : 'rejected';
    if (kind === 'user') {
      const patch: Partial<AppUser> = { status };
      editUser(id, patch);
    } else {
      const approvedCat = bizCategory[id] || '';
      editBusiness(id, { status, approvedCategory: approvedCat });
    }
    showToast(
      type === 'approve'
        ? `Registration approved successfully!`
        : `Registration rejected.`,
      type === 'approve' ? 'success' : 'error',
    );
    setConfirmAction(null);
    setExpandedId(null);
  };

  const rows = [...filteredCustomers, ...filteredBiz];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === f.id
                ? 'bg-ocean-600 text-white shadow-soft'
                : 'bg-white text-navy-600 border border-navy-200 hover:bg-navy-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="rounded-3xl border border-navy-100 bg-white p-10 text-center text-navy-400">
          No registrations found for this filter.
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row) => {
          const isUser = row._kind === 'user';
          const id     = row.id;
          const name   = isUser ? (row as AppUser).name : (row as AppBusiness).businessName;
          const email  = row.email;
          const status = row.status;
          const expanded = expandedId === id;

          return (
            <div key={id} className="rounded-3xl border border-navy-100 bg-white shadow-card overflow-hidden">
              {/* Row header */}
              <div className="flex items-center gap-4 p-4">
                <div className={`grid h-10 w-10 place-items-center rounded-2xl ${isUser ? 'bg-ocean-100 text-ocean-600' : 'bg-sand-100 text-sand-600'}`}>
                  {isUser ? <UserIcon size={18} /> : <Building2 size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy-900 truncate">{name}</p>
                  <p className="text-xs text-navy-400">{email} · {isUser ? 'Customer' : 'Business'}</p>
                </div>
                <span className={`chip border text-xs ${statusChip[status]}`}>{status}</span>
                <button
                  onClick={() => setExpandedId(expanded ? null : id)}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-navy-50 text-navy-400 transition"
                >
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Expanded details */}
              {expanded && (
                <div className="border-t border-navy-100 p-4 space-y-4 animate-fade-in">
                  {isUser ? (
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-navy-400">Name:</span> <span className="font-medium text-navy-800">{(row as AppUser).name}</span></div>
                      <div><span className="text-navy-400">Email:</span> <span className="font-medium text-navy-800">{email}</span></div>
                      <div><span className="text-navy-400">Registered:</span> <span className="font-medium text-navy-800">{new Date((row as AppUser).createdAt).toLocaleDateString()}</span></div>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      {[
                        ['Business Name', (row as AppBusiness).businessName],
                        ['Owner', (row as AppBusiness).ownerName],
                        ['Phone', (row as AppBusiness).phone],
                        ['Location', (row as AppBusiness).location],
                        ['Category', (row as AppBusiness).category],
                        ['Registered', new Date((row as AppBusiness).createdAt).toLocaleDateString()],
                      ].map(([label, val]) => (
                        <div key={label}><span className="text-navy-400">{label}:</span> <span className="font-medium text-navy-800">{val}</span></div>
                      ))}
                      <div className="sm:col-span-2">
                        <span className="text-navy-400">Description:</span>
                        <p className="mt-1 text-navy-700 text-xs leading-relaxed">{(row as AppBusiness).description}</p>
                      </div>
                      {status === 'pending' && (
                        <div className="sm:col-span-2">
                          <label className="label">Assign Category on Approval</label>
                          <select
                            value={bizCategory[id] || (row as AppBusiness).category}
                            onChange={(e) => setBizCategory((p) => ({ ...p, [id]: e.target.value }))}
                            className="input text-sm"
                          >
                            <option value="">— Use requested category —</option>
                            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {status === 'pending' && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleReject(id, row._kind, name)}
                        className="flex items-center gap-2 rounded-full border border-error-200 bg-error-50 px-5 py-2.5 text-sm font-semibold text-error-700 hover:bg-error-100 transition"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(id, row._kind, name)}
                        className="flex items-center gap-2 btn-primary py-2.5 text-sm"
                      >
                        <CheckCircle2 size={15} /> Approve
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.type === 'approve' ? 'Approve Registration?' : 'Reject Registration?'}
          message={
            confirmAction.type === 'approve'
              ? `This will approve "${confirmAction.name}" and allow them to log in.`
              : `This will reject "${confirmAction.name}". They will not be able to log in.`
          }
          confirmLabel={confirmAction.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
          danger={confirmAction.type === 'reject'}
          onConfirm={doAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
