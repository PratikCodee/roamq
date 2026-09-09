import { useRef, useState } from 'react';
import { X, ImagePlus, MapPin, Clock, DollarSign, Star, Compass, Trash2 } from 'lucide-react';
import { places as staticPlaces } from '@/data/sampleData';
import { useAppData } from '@/context/AppDataContext';
import { showToast } from '@/components/ui/Toast';
import type { AppPlace } from '@/store/types';

type PlaceForm = Omit<AppPlace, 'id' | 'createdAt' | 'updatedAt'>;

const EMPTY: PlaceForm = {
  destinationId: 'dest-ratnagiri',
  name: '', category: '', description: '', image: '',
  location: '', lat: 16.9909, lng: 73.312,
  openingTime: '9:00 AM', closingTime: '6:00 PM',
  entryFee: 'Free', bestTimeToVisit: '', visitDuration: '1-2 hours',
  rating: 4.0, reviewsCount: 0, isHiddenGem: false,
  featuredInSeasons: [],
};

interface Props {
  place?: AppPlace;   // undefined = adding new
  onClose: () => void;
}

export function PlaceEditor({ place, onClose }: Props) {
  const { addPlace, editPlace, removePlace, categories } = useAppData();
  const [form, setForm] = useState<PlaceForm>(() => {
    if (!place) return EMPTY;
    const match = staticPlaces.find((sp) => sp.id === place.id);
    return {
      ...place,
      featuredInSeasons: place.featuredInSeasons ?? match?.featuredInSeasons ?? [],
      seasons: place.seasons ?? match?.seasons ?? ['year-round'],
      videoUrl: place.videoUrl ?? match?.videoUrl ?? '',
      seasonalHighlight: place.seasonalHighlight ?? match?.seasonalHighlight ?? '',
    };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PlaceForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof PlaceForm>(k: K, v: PlaceForm[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);
          set('image', compressedDataUrl);
        } else {
          set('image', reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim())        e.name        = 'Name is required.';
    if (!form.category)           e.category    = 'Select a category.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.location.trim())    e.location    = 'Location is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    try {
      if (place) {
        editPlace(place.id, form);
        showToast('Place updated successfully! ✅');
      } else {
        addPlace(form);
        showToast('Place added successfully! ✅');
      }
      setSaving(false);
      onClose();
    } catch (err) {
      setSaving(false);
      showToast(
        err instanceof Error
          ? `❌ Save failed: ${err.message}`
          : '❌ Save failed — storage may be full. Please use Reset Cache in the admin header.',
        'error',
      );
    }
  };


  const placeCategories = categories.map((c) => c.name);

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-navy-100">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-100 bg-white px-6 py-4 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-ocean-100 text-ocean-600">
              <Compass size={20} />
            </div>
            <div>
              <h2 className="font-bold text-navy-900">{place ? 'Edit Place' : 'Add New Place'}</h2>
              <p className="text-xs text-navy-400">Changes appear on the public site instantly</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-navy-100 text-navy-500 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image */}
          <div>
            <label className="label">Photo</label>
            {form.image ? (
              <div className="relative h-44 rounded-2xl overflow-hidden border border-navy-200 group">
                <img src={form.image} alt="preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/40 transition flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => imgRef.current?.click()}
                    className="opacity-0 group-hover:opacity-100 transition btn-primary text-sm py-2 px-4"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imgRef.current?.click()}
                className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy-200 bg-navy-50 text-navy-400 hover:border-ocean-400 hover:text-ocean-500 transition"
              >
                <ImagePlus size={24} />
                <span className="text-sm font-medium">Upload photo or enter URL below</span>
              </button>
            )}
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <input
              type="text"
              value={form.image.startsWith('data:') ? '' : form.image}
              onChange={(e) => set('image', e.target.value)}
              placeholder="Or paste an image URL…"
              className="input mt-2 text-sm"
            />
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Place Name *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Ganpatipule Beach" className="input" />
              {errors.name && <p className="text-xs text-error-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Category *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input">
                <option value="">— Select —</option>
                {placeCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-error-600 mt-1">{errors.category}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="input resize-none"
              placeholder="Describe this place for travellers…"
            />
            {errors.description && <p className="text-xs text-error-600 mt-1">{errors.description}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="label"><MapPin size={13} className="inline mr-1" />Location *</label>
            <input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. Ganpatipule, 25 km from Ratnagiri" className="input" />
            {errors.location && <p className="text-xs text-error-600 mt-1">{errors.location}</p>}
          </div>

          {/* Hours & Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label"><Clock size={13} className="inline mr-1" />Opening Time</label>
              <input value={form.openingTime} onChange={(e) => set('openingTime', e.target.value)} className="input text-sm" />
            </div>
            <div>
              <label className="label"><Clock size={13} className="inline mr-1" />Closing Time</label>
              <input value={form.closingTime} onChange={(e) => set('closingTime', e.target.value)} className="input text-sm" />
            </div>
            <div>
              <label className="label"><DollarSign size={13} className="inline mr-1" />Entry Fee</label>
              <input value={form.entryFee} onChange={(e) => set('entryFee', e.target.value)} className="input text-sm" />
            </div>
          </div>

          {/* Visit info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Best Time to Visit</label>
              <input value={form.bestTimeToVisit} onChange={(e) => set('bestTimeToVisit', e.target.value)} className="input text-sm" placeholder="e.g. November–February" />
            </div>
            <div>
              <label className="label">Visit Duration</label>
              <input value={form.visitDuration} onChange={(e) => set('visitDuration', e.target.value)} className="input text-sm" placeholder="e.g. 2-3 hours" />
            </div>
          </div>

          {/* Rating & Hidden Gem */}
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="label"><Star size={13} className="inline mr-1" />Rating (0–5)</label>
              <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => set('rating', parseFloat(e.target.value))} className="input text-sm" />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-navy-700 cursor-pointer mt-5">
              <input type="checkbox" checked={form.isHiddenGem} onChange={(e) => set('isHiddenGem', e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-ocean-600" />
              Mark as Hidden Gem
            </label>
          </div>

          {/* ── VIDEO & SEASONAL HIGHLIGHTS ── */}
          <div className="rounded-2xl bg-ocean-50/50 border border-ocean-100 p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ocean-800 flex items-center gap-1.5">
              <Compass size={14} className="text-ocean-600" /> Video Preview & Seasonal Smart Recommendations
            </h3>

            <div>
              <label className="label">Video Preview URL (YouTube, YouTube Shorts, Vimeo, or MP4 URL)</label>
              <input
                type="text"
                value={form.videoUrl ?? ''}
                onChange={(e) => set('videoUrl', e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/... or MP4 link"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label">Seasonal Recommendation Reason</label>
              <input
                type="text"
                value={form.seasonalHighlight ?? ''}
                onChange={(e) => set('seasonalHighlight', e.target.value)}
                placeholder="e.g. 🌧️ Full-flow 100ft cascading waterfall during monsoon"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label">Recommended Seasons</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { id: 'monsoon', label: '🌧️ Monsoon' },
                  { id: 'winter', label: '☀️ Winter' },
                  { id: 'summer', label: '🥭 Summer' },
                  { id: 'year-round', label: '🌐 Year-Round' },
                ].map((s) => {
                  const currentSeasons = form.seasons ?? [];
                  const isChecked = currentSeasons.includes(s.id as any);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        const updated = isChecked
                          ? currentSeasons.filter((item) => item !== s.id)
                          : [...currentSeasons, s.id as any];
                        set('seasons', updated);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        isChecked
                          ? 'bg-ocean-600 text-white border-ocean-600 shadow-sm'
                          : 'bg-white text-navy-600 border-navy-200 hover:bg-navy-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkboxes to feature place in specific season banners */}
            <div className="pt-2 border-t border-ocean-100">
              <div className="flex items-center justify-between mb-1">
                <label className="label text-navy-800 font-bold mb-0">
                  Feature in Seasonal Banner ("Must Experience This...")
                </label>
                {(form.featuredInSeasons && form.featuredInSeasons.length > 0) && (
                  <button
                    type="button"
                    onClick={() => set('featuredInSeasons', [])}
                    className="text-xs text-navy-500 hover:text-error-600 flex items-center gap-1 font-semibold transition"
                  >
                    <Trash2 size={12} /> Clear seasonal choices
                  </button>
                )}
              </div>
              <p className="text-xs text-navy-500 mb-2">
                Check to feature this location prominently in specific seasonal banners on the Destination page.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'monsoon', label: '🌧️ Must Experience This Monsoon' },
                  { id: 'winter',  label: '☀️ Must Experience This Winter' },
                  { id: 'summer',  label: '🥭 Must Experience This Summer' },
                ].map((s) => {
                  const currentFeatured = form.featuredInSeasons ?? [];
                  const isChecked = currentFeatured.includes(s.id as any);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                        isChecked
                          ? 'bg-ocean-50/80 border-ocean-300 text-ocean-900 shadow-xs'
                          : 'bg-white border-navy-200 text-navy-700 hover:border-navy-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...currentFeatured, s.id as any]
                            : currentFeatured.filter((item) => item !== s.id);
                          set('featuredInSeasons', updated);
                        }}
                        className="h-4 w-4 rounded border-navy-300 text-ocean-600 focus:ring-ocean-500"
                      />
                      <span>{s.label}</span>
                    </label>
                  );
                })}
              </div>

              {/* Delete / Remove option below the section to choose must visit places */}
              {place && (
                <div className="mt-4 pt-3 border-t border-ocean-100 flex items-center justify-between bg-error-50/50 -mx-4 -mb-4 p-4 rounded-b-2xl border-b border-error-100">
                  <div>
                    <p className="text-xs font-bold text-error-800">Delete This Place</p>
                    <p className="text-[11px] text-error-600">Remove this place permanently from the platform</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${place.name}"?`)) {
                        removePlace(place.id);
                        showToast('Place deleted successfully.', 'info');
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-error-300 bg-error-600 text-white px-3.5 py-1.5 text-xs font-bold hover:bg-error-700 transition shadow-sm"
                  >
                    <Trash2 size={14} /> Delete Place
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-navy-100 bg-white px-6 py-4 rounded-b-3xl">
          {place ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${place.name}"?`)) {
                  removePlace(place.id);
                  showToast('Place deleted successfully.', 'info');
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-error-200 bg-error-50 px-4 py-2 text-xs font-bold text-error-600 hover:bg-error-100 transition"
            >
              <Trash2 size={15} /> Delete Place
            </button>
          ) : <div />}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn-secondary px-6">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
              {saving ? 'Saving…' : place ? 'Save Changes' : 'Add Place'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
