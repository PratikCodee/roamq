import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { showToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { AppCategory } from '@/store/types';

export function CategoryManager() {
  const { categories, places, businesses, addCategory, renameCategory, removeCategory } = useAppData();
  const [newName, setNewName]   = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName]   = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AppCategory | null>(null);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) { showToast('Category name cannot be empty.', 'error'); return; }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      showToast('A category with that name already exists.', 'error');
      return;
    }
    addCategory(name);
    setNewName('');
    showToast(`Category "${name}" created!`);
  };

  const startEdit = (cat: AppCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = () => {
    const name = editName.trim();
    if (!name || !editingId) return;
    renameCategory(editingId, name);
    showToast('Category renamed!');
    setEditingId(null);
  };

  const requestDelete = (cat: AppCategory) => {
    setDeleteTarget(cat);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    // Check orphan — places or businesses using this category
    const usedByPlaces = places.filter((p) => p.category === deleteTarget.name).length;
    const usedByBiz    = businesses.filter((b) => b.approvedCategory === deleteTarget.name).length;
    if (usedByPlaces + usedByBiz > 0) {
      showToast(
        `Cannot delete: ${usedByPlaces} place(s) and ${usedByBiz} business(es) use this category. Reassign them first.`,
        'error',
      );
      setDeleteTarget(null);
      return;
    }
    removeCategory(deleteTarget.id);
    showToast(`Category "${deleteTarget.name}" deleted.`, 'info');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Add new */}
      <div className="rounded-3xl border border-navy-100 bg-white shadow-card p-5">
        <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2"><Tag size={16} className="text-ocean-600" /> Add New Category</h3>
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. Waterfall, Heritage…"
            className="input flex-1"
          />
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2 px-5">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-3xl border border-navy-100 bg-white shadow-card overflow-hidden">
        <div className="border-b border-navy-100 px-5 py-4">
          <h3 className="font-bold text-navy-900">{categories.length} Categories</h3>
        </div>
        <ul className="divide-y divide-navy-50">
          {categories.map((cat) => {
            const placeCount = places.filter((p) => p.category === cat.name).length;
            const bizCount   = businesses.filter((b) => b.approvedCategory === cat.name).length;
            return (
              <li key={cat.id} className="flex items-center gap-4 px-5 py-3 hover:bg-navy-50/50 transition">
                {editingId === cat.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      className="input flex-1 py-2 text-sm"
                      autoFocus
                    />
                    <button onClick={saveEdit} className="grid h-8 w-8 place-items-center rounded-full bg-success-100 text-success-600 hover:bg-success-200 transition">
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="grid h-8 w-8 place-items-center rounded-full bg-navy-100 text-navy-500 hover:bg-navy-200 transition">
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid h-9 w-9 place-items-center rounded-2xl bg-ocean-50 text-ocean-600">
                      <Tag size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-navy-900 text-sm">{cat.name}</p>
                      <p className="text-xs text-navy-400">{placeCount} places · {bizCount} businesses</p>
                    </div>
                    <button onClick={() => startEdit(cat)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-navy-100 text-navy-400 hover:text-navy-700 transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => requestDelete(cat)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-error-50 text-navy-400 hover:text-error-500 transition">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Category?"
          message={`Delete "${deleteTarget.name}"? This cannot be undone. If any places or businesses use this category, deletion will be blocked.`}
          confirmLabel="Delete"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
