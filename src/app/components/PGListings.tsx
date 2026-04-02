import { useEffect, useMemo, useState } from "react";
import {
  Bed,
  Check,
  Edit,
  Eye,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { listingsApi } from "../../lib/api";
import type { FoodMenu, ListingStatus, PGListing, RoomType } from "../../lib/types";
import { themeColors, useTheme } from "./ThemeContext";

const EMPTY_FOOD_MENU: FoodMenu = {
  breakfast: false,
  lunch: false,
  dinner: false,
  menu_details: "",
};

function createInitialForm(): Partial<PGListing> {
  return {
    name: "",
    location: "",
    reception_phone: "",
    capacity: 0,
    occupied: 0,
    room_types: [],
    gender: "Male Only",
    property_type: "PG",
    status: "active",
    one_day_stay: false,
    has_gym: false,
    has_ac: false,
    has_non_ac: false,
    has_gaming_space: false,
    gaming_space_area: 0,
    has_parking: false,
    parking_capacity: 0,
    food_menu: { ...EMPTY_FOOD_MENU },
    image_url: "",
  };
}

function normalizeStatus(status?: string): ListingStatus {
  return String(status || "active").toLowerCase() === "inactive" ? "inactive" : "active";
}

function formatStatus(status?: string) {
  return normalizeStatus(status) === "active" ? "Active" : "Inactive";
}

function buildPayload(formData: Partial<PGListing>) {
  return {
    name: formData.name?.trim() || "",
    location: formData.location?.trim() || "",
    reception_phone: formData.reception_phone?.trim() || "",
    capacity: Number(formData.capacity) || 0,
    occupied: Number(formData.occupied) || 0,
    room_types: (formData.room_types || []).map((room) => ({
      variant: room.variant,
      price_ac: Number(room.price_ac) || 0,
      price_non_ac: Number(room.price_non_ac) || 0,
      available: Number(room.available) || 0,
    })),
    gender: formData.gender || "Male Only",
    property_type: formData.property_type || "PG",
    status: normalizeStatus(formData.status),
    one_day_stay: Boolean(formData.one_day_stay),
    has_gym: Boolean(formData.has_gym),
    has_ac: Boolean(formData.has_ac),
    has_non_ac: Boolean(formData.has_non_ac),
    has_gaming_space: Boolean(formData.has_gaming_space),
    gaming_space_area: Number(formData.gaming_space_area) || 0,
    has_parking: Boolean(formData.has_parking),
    parking_capacity: Number(formData.parking_capacity) || 0,
    food_menu: {
      breakfast: Boolean(formData.food_menu?.breakfast),
      lunch: Boolean(formData.food_menu?.lunch),
      dinner: Boolean(formData.food_menu?.dinner),
      menu_details: formData.food_menu?.menu_details?.trim() || "",
    },
    image_url: formData.image_url || null,
  };
}

export function PGListings() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const [pgListings, setPGListings] = useState<PGListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [filterPropertyType, setFilterPropertyType] = useState("All");
  const [showEditor, setShowEditor] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedListing, setSelectedListing] = useState<PGListing | null>(null);
  const [editingListing, setEditingListing] = useState<PGListing | null>(null);
  const [formData, setFormData] = useState<Partial<PGListing>>(createInitialForm());

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await listingsApi.getAll({ limit: 100 });
      if (response.success) setPGListings(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    return pgListings.filter((listing) => {
      const matchesSearch =
        listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGender = filterGender === "All" || listing.gender === filterGender;
      const matchesType =
        filterPropertyType === "All" || listing.property_type === filterPropertyType;

      return matchesSearch && matchesGender && matchesType;
    });
  }, [filterGender, filterPropertyType, pgListings, searchQuery]);

  const resetForm = () => {
    setFormData(createInitialForm());
    setEditingListing(null);
  };

  const validateAndBuild = () => {
    const payload = buildPayload(formData);
    if (!payload.name || !payload.location || !payload.reception_phone) {
      toast.error("Name, location, and phone are required");
      return null;
    }
    if (payload.capacity <= 0) {
      toast.error("Capacity must be greater than zero");
      return null;
    }
    if (payload.occupied > payload.capacity) {
      toast.error("Occupied count cannot exceed capacity");
      return null;
    }
    if (payload.room_types.length === 0) {
      toast.error("Add at least one room type");
      return null;
    }
    return payload;
  };

  const handleSave = async () => {
    const payload = validateAndBuild();
    if (!payload) return;

    try {
      const response = editingListing
        ? await listingsApi.update(editingListing.id, payload)
        : await listingsApi.create(payload);

      if (response.success) {
        toast.success(editingListing ? "Property updated" : "Property added");
        setShowEditor(false);
        resetForm();
        await loadListings();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save property");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property?")) return;

    try {
      const response = await listingsApi.delete(id);
      if (response.success) {
        toast.success("Property deleted");
        await loadListings();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete property");
    }
  };

  const openEditor = (listing?: PGListing) => {
    if (listing) {
      setEditingListing(listing);
      setFormData({
        ...listing,
        room_types: listing.room_types || [],
        food_menu: listing.food_menu || { ...EMPTY_FOOD_MENU },
        status: normalizeStatus(listing.status),
        image_url: listing.image_url || "",
      });
    } else {
      resetForm();
    }
    setShowEditor(true);
  };

  const updateRoomType = (index: number, field: keyof RoomType, value: string | number) => {
    setFormData((current) => {
      const nextRoomTypes = [...(current.room_types || [])];
      nextRoomTypes[index] = { ...nextRoomTypes[index], [field]: value } as RoomType;
      return { ...current, room_types: nextRoomTypes };
    });
  };

  if (loading && pgListings.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PG & Hotel Listings</h1>
          <p className="text-sm text-gray-500">Manage inventory, pricing, and occupancy.</p>
        </div>
        <button
          onClick={() => openEditor()}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white shadow-lg ${colors.primary}`}
        >
          <Plus className="h-4 w-4" />
          Add Property
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search listings..."
              className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterGender}
            onChange={(event) => setFilterGender(event.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All genders</option>
            <option value="Male Only">Male Only</option>
            <option value="Female Only">Female Only</option>
            <option value="Co-living">Co-living</option>
          </select>
          <select
            value={filterPropertyType}
            onChange={(event) => setFilterPropertyType(event.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All types</option>
            <option value="PG">PG</option>
            <option value="Hotel">Hotel</option>
          </select>
        </div>
      </div>

      {filteredListings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((listing) => {
            const occupancyPercent =
              listing.capacity > 0 ? Math.min((listing.occupied / listing.capacity) * 100, 100) : 0;
            const startingPrice = (listing.room_types || [])
              .flatMap((room) => [room.price_ac, room.price_non_ac])
              .filter((price) => price > 0)
              .sort((left, right) => left - right)[0] || 0;

            return (
              <div key={listing.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{listing.name}</h2>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.location}</span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        normalizeStatus(listing.status) === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {formatStatus(listing.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Category</p>
                      <p className="mt-1 font-medium text-gray-900">{listing.property_type}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Audience</p>
                      <p className="mt-1 font-medium text-gray-900">{listing.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Phone</p>
                      <p className="mt-1 font-medium text-gray-900">{listing.reception_phone}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Starting Price</p>
                      <p className="mt-1 font-medium text-gray-900">Rs. {(startingPrice || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                      <span>Occupancy</span>
                      <span>{listing.occupied}/{listing.capacity}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${theme === "blue" ? "bg-blue-600" : theme === "purple" ? "bg-purple-600" : "bg-emerald-600"}`}
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedListing(listing);
                        setShowViewer(true);
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => openEditor(listing)}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white ${colors.primary}`}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="rounded-xl bg-red-50 px-3 py-2 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-sm text-gray-500">
          No properties match the current filters.
        </div>
      )}

      {showEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editingListing ? "Edit Property" : "Add Property"}
              </h2>
              <button onClick={() => { setShowEditor(false); resetForm(); }} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <div className="space-y-3">
                {[
                  ["Property Name", "name"],
                  ["Location", "location"],
                  ["Reception Phone", "reception_phone"],
                ].map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600">{label}</span>
                    <input
                      value={String(formData[key as keyof PGListing] || "")}
                      onChange={(event) => setFormData({ ...formData, [key]: event.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600">Capacity</span>
                    <input
                      type="number"
                      value={formData.capacity ?? 0}
                      onChange={(event) => setFormData({ ...formData, capacity: Number(event.target.value) || 0 })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-600">Occupied</span>
                    <input
                      type="number"
                      value={formData.occupied ?? 0}
                      onChange={(event) => setFormData({ ...formData, occupied: Number(event.target.value) || 0 })}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.gender || "Male Only"}
                    onChange={(event) => setFormData({ ...formData, gender: event.target.value as PGListing["gender"] })}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male Only">Male Only</option>
                    <option value="Female Only">Female Only</option>
                    <option value="Co-living">Co-living</option>
                  </select>
                  <select
                    value={formData.property_type || "PG"}
                    onChange={(event) => setFormData({ ...formData, property_type: event.target.value as PGListing["property_type"] })}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PG">PG</option>
                    <option value="Hotel">Hotel</option>
                  </select>
                </div>

                <select
                  value={normalizeStatus(formData.status)}
                  onChange={(event) => setFormData({ ...formData, status: event.target.value as ListingStatus })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">Room Types</h3>
                    <button onClick={() => setFormData({ ...formData, room_types: [...(formData.room_types || []), { variant: "Single", price_ac: 0, price_non_ac: 0, available: 0 }] })} className={`rounded-lg px-3 py-1 text-xs text-white ${colors.primary}`}>
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(formData.room_types || []).map((room, index) => (
                      <div key={`room-${index}`} className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2">
                        <select value={room.variant} onChange={(event) => updateRoomType(index, "variant", event.target.value)} className="rounded-lg border border-gray-300 px-2 py-2 text-xs">
                          <option value="Single">Single</option>
                          <option value="2-Share">2-Share</option>
                          <option value="3-Share">3-Share</option>
                          <option value="4-Share">4-Share</option>
                          <option value="5-Share">5-Share</option>
                        </select>
                        <input type="number" value={room.price_ac} onChange={(event) => updateRoomType(index, "price_ac", Number(event.target.value) || 0)} className="rounded-lg border border-gray-300 px-2 py-2 text-xs" placeholder="AC" />
                        <input type="number" value={room.price_non_ac} onChange={(event) => updateRoomType(index, "price_non_ac", Number(event.target.value) || 0)} className="rounded-lg border border-gray-300 px-2 py-2 text-xs" placeholder="Non-AC" />
                        <button onClick={() => setFormData({ ...formData, room_types: (formData.room_types || []).filter((_, roomIndex) => roomIndex !== index) })} className="rounded-lg bg-red-50 px-2 text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600">Image URL</span>
                  <input
                    value={formData.image_url || ""}
                    onChange={(event) => setFormData({ ...formData, image_url: event.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://..."
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600">Food Menu Notes</span>
                  <textarea
                    value={formData.food_menu?.menu_details || ""}
                    onChange={(event) => setFormData({ ...formData, food_menu: { ...(formData.food_menu || EMPTY_FOOD_MENU), menu_details: event.target.value } })}
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
              <button onClick={() => { setShowEditor(false); resetForm(); }} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
                Cancel
              </button>
              <button onClick={handleSave} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white ${colors.primary}`}>
                <Check className="h-4 w-4" />
                {editingListing ? "Update Property" : "Create Property"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showViewer && selectedListing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">{selectedListing.name}</h2>
              <button onClick={() => setShowViewer(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Contact</p>
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{selectedListing.location}</div>
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{selectedListing.reception_phone}</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Meta</p>
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <div>{selectedListing.property_type} • {selectedListing.gender}</div>
                    <div>Status: {formatStatus(selectedListing.status)}</div>
                    <div>Occupancy: {selectedListing.occupied}/{selectedListing.capacity}</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Bed className="h-4 w-4" />
                  Room Types
                </div>
                <div className="space-y-2">
                  {(selectedListing.room_types || []).map((room, index) => (
                    <div key={`view-room-${index}`} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm">
                      <span>{room.variant}</span>
                      <span>Rs. {(Math.max(room.price_ac || 0, room.price_non_ac || 0) || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
