import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MapPin, 
  Users,
  X,
  Dumbbell,
  Wind,
  Gamepad2,
  UtensilsCrossed,
  Hotel as HotelIcon,
  Home,
  Calendar,
  Eye,
  Check,
  Car,
  Bed,
  UserPlus,
  Phone,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { useTheme, themeColors } from "./ThemeContext";

type RoomVariant = "Single" | "2-Share" | "3-Share" | "4-Share" | "5-Share";

interface RoomType {
  variant: RoomVariant;
  priceAC: number;
  priceNonAC: number;
  available: number;
}

interface FoodMenu {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  menuDetails: string;
}

interface PGListing {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  receptionPhone: string;
  capacity: number;
  occupied: number;
  roomTypes: RoomType[];
  gender: "Male Only" | "Female Only" | "Co-living";
  propertyType: "PG" | "Hotel";
  oneDayStay: boolean;
  hasGym: boolean;
  hasAC: boolean;
  hasNonAC: boolean;
  hasGamingSpace: boolean;
  gamingSpaceArea?: number;
  hasParking: boolean;
  parkingCapacity?: number;
  foodMenu?: FoodMenu;
  status: "Active" | "Inactive";
  image: string;
  images: string[];
}

// Initial dummy data with all fields
const initialPGListings: PGListing[] = [
  {
    id: 1,
    name: "Green Valley Boys PG",
    location: "Koramangala, Bangalore",
    latitude: 12.9352,
    longitude: 77.6245,
    receptionPhone: "+91 98765 43210",
    capacity: 20,
    occupied: 15,
    roomTypes: [
      { variant: "Single", priceAC: 15000, priceNonAC: 12000, available: 2 },
      { variant: "2-Share", priceAC: 12000, priceNonAC: 9000, available: 4 },
      { variant: "3-Share", priceAC: 10000, priceNonAC: 8000, available: 3 },
    ],
    gender: "Male Only",
    propertyType: "PG",
    oneDayStay: false,
    hasGym: true,
    hasAC: true,
    hasNonAC: true,
    hasGamingSpace: true,
    gamingSpaceArea: 200,
    hasParking: true,
    parkingCapacity: 15,
    foodMenu: {
      breakfast: true,
      lunch: true,
      dinner: true,
      menuDetails: "South Indian & North Indian cuisine"
    },
    status: "Active",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 2,
    name: "Sunrise Girls Hostel",
    location: "HSR Layout, Bangalore",
    latitude: 12.9116,
    longitude: 77.6473,
    receptionPhone: "+91 98765 43211",
    capacity: 30,
    occupied: 28,
    roomTypes: [
      { variant: "Single", priceAC: 18000, priceNonAC: 0, available: 1 },
      { variant: "2-Share", priceAC: 15500, priceNonAC: 0, available: 2 },
      { variant: "4-Share", priceAC: 12000, priceNonAC: 0, available: 3 },
    ],
    gender: "Female Only",
    propertyType: "PG",
    oneDayStay: false,
    hasGym: true,
    hasAC: true,
    hasNonAC: false,
    hasGamingSpace: false,
    hasParking: true,
    parkingCapacity: 20,
    foodMenu: {
      breakfast: true,
      lunch: true,
      dinner: true,
      menuDetails: "Homely vegetarian meals"
    },
    status: "Active",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 3,
    name: "City Center Co-living",
    location: "Whitefield, Bangalore",
    latitude: 12.9698,
    longitude: 77.7499,
    receptionPhone: "+91 98765 43212",
    capacity: 15,
    occupied: 12,
    roomTypes: [
      { variant: "2-Share", priceAC: 11000, priceNonAC: 9500, available: 2 },
      { variant: "3-Share", priceAC: 10500, priceNonAC: 8500, available: 3 },
      { variant: "5-Share", priceAC: 8500, priceNonAC: 7000, available: 2 },
    ],
    gender: "Co-living",
    propertyType: "PG",
    oneDayStay: true,
    hasGym: false,
    hasAC: true,
    hasNonAC: true,
    hasGamingSpace: true,
    gamingSpaceArea: 150,
    hasParking: false,
    status: "Active",
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 4,
    name: "Comfort Hotel & Stay",
    location: "Indiranagar, Bangalore",
    latitude: 12.9716,
    longitude: 77.6412,
    receptionPhone: "+91 98765 43213",
    capacity: 25,
    occupied: 20,
    roomTypes: [
      { variant: "Single", priceAC: 3500, priceNonAC: 0, available: 3 },
      { variant: "2-Share", priceAC: 2500, priceNonAC: 0, available: 5 },
    ],
    gender: "Co-living",
    propertyType: "Hotel",
    oneDayStay: true,
    hasGym: true,
    hasAC: true,
    hasNonAC: false,
    hasGamingSpace: false,
    hasParking: true,
    parkingCapacity: 30,
    foodMenu: {
      breakfast: true,
      lunch: true,
      dinner: true,
      menuDetails: "Multi-cuisine restaurant"
    },
    status: "Active",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop"
    ]
  },
];

export function PGListings() {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  
  const [pgListings, setPGListings] = useState<PGListing[]>(initialPGListings);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [filterPropertyType, setFilterPropertyType] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPG, setSelectedPG] = useState<PGListing | null>(null);
  const [editingPG, setEditingPG] = useState<PGListing | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<PGListing>>({
    name: "",
    location: "",
    latitude: 0,
    longitude: 0,
    receptionPhone: "",
    capacity: 0,
    occupied: 0,
    roomTypes: [],
    gender: "Male Only",
    propertyType: "PG",
    oneDayStay: false,
    hasGym: false,
    hasAC: false,
    hasNonAC: false,
    hasGamingSpace: false,
    gamingSpaceArea: 0,
    hasParking: false,
    parkingCapacity: 0,
    status: "Active",
    foodMenu: {
      breakfast: false,
      lunch: false,
      dinner: false,
      menuDetails: ""
    },
    images: []
  });

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const filteredListings = pgListings.filter((pg) => {
    const matchesSearch =
      pg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pg.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = filterGender === "All" || pg.gender === filterGender;
    const matchesType = filterPropertyType === "All" || pg.propertyType === filterPropertyType;
    return matchesSearch && matchesGender && matchesType;
  });

  const handleAddPG = () => {
    const newPG: PGListing = {
      id: pgListings.length + 1,
      ...formData,
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop"
      ]
    } as PGListing;
    
    setPGListings([...pgListings, newPG]);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditPG = () => {
    if (editingPG) {
      setPGListings(pgListings.map(pg => 
        pg.id === editingPG.id ? { ...pg, ...formData } : pg
      ));
      setShowAddModal(false);
      setEditingPG(null);
      resetForm();
    }
  };

  const handleDeletePG = (id: number) => {
    if (confirm("Are you sure you want to delete this property?")) {
      setPGListings(pgListings.filter(pg => pg.id !== id));
    }
  };

  const openEditModal = (pg: PGListing) => {
    setEditingPG(pg);
    setFormData(pg);
    setShowAddModal(true);
  };

  const openViewModal = (pg: PGListing) => {
    setSelectedPG(pg);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      latitude: 0,
      longitude: 0,
      receptionPhone: "",
      capacity: 0,
      occupied: 0,
      roomTypes: [],
      gender: "Male Only",
      propertyType: "PG",
      oneDayStay: false,
      hasGym: false,
      hasAC: false,
      hasNonAC: false,
      hasGamingSpace: false,
      gamingSpaceArea: 0,
      hasParking: false,
      parkingCapacity: 0,
      status: "Active",
      foodMenu: {
        breakfast: false,
        lunch: false,
        dinner: false,
        menuDetails: ""
      },
      images: []
    });
    setUploadedImages([]);
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const imageUrl = reader.result as string;
          setUploadedImages((prev) => [...prev, imageUrl]);
          setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), imageUrl]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const addRoomType = () => {
    setFormData({
      ...formData,
      roomTypes: [...(formData.roomTypes || []), { variant: "Single", priceAC: 0, priceNonAC: 0, available: 0 }]
    });
  };

  const removeRoomType = (index: number) => {
    setFormData({
      ...formData,
      roomTypes: formData.roomTypes?.filter((_, i) => i !== index)
    });
  };

  const updateRoomType = (index: number, field: keyof RoomType, value: any) => {
    const updatedRoomTypes = [...(formData.roomTypes || [])];
    updatedRoomTypes[index] = { ...updatedRoomTypes[index], [field]: value };
    setFormData({ ...formData, roomTypes: updatedRoomTypes });
  };

  const stats = {
    total: pgListings.length,
    maleOnly: pgListings.filter(p => p.gender === "Male Only").length,
    femaleOnly: pgListings.filter(p => p.gender === "Female Only").length,
    coLiving: pgListings.filter(p => p.gender === "Co-living").length,
    hotels: pgListings.filter(p => p.propertyType === "Hotel").length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PG & Hotel Listings</h1>
          <p className="text-xs text-gray-500 mt-1">Manage all your properties and room variants</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingPG(null);
            setShowAddModal(true);
          }}
          className={`flex items-center gap-2 px-4 py-2 ${colors.primary} text-white rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm`}
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className={`bg-gradient-to-br ${colors.gradient} text-white rounded-xl shadow-md p-3 transform hover:scale-105 transition-all`}>
          <Home className="w-5 h-5 opacity-50 mb-1" />
          <p className="text-xs text-white/70">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl shadow-md p-3 transform hover:scale-105 transition-all">
          <Users className="w-5 h-5 opacity-50 mb-1" />
          <p className="text-xs text-white/70">Male Only</p>
          <p className="text-2xl font-bold">{stats.maleOnly}</p>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-pink-700 text-white rounded-xl shadow-md p-3 transform hover:scale-105 transition-all">
          <Users className="w-5 h-5 opacity-50 mb-1" />
          <p className="text-xs text-white/70">Female Only</p>
          <p className="text-2xl font-bold">{stats.femaleOnly}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl shadow-md p-3 transform hover:scale-105 transition-all">
          <UserPlus className="w-5 h-5 opacity-50 mb-1" />
          <p className="text-xs text-white/70">Co-living</p>
          <p className="text-2xl font-bold">{stats.coLiving}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-xl shadow-md p-3 transform hover:scale-105 transition-all">
          <HotelIcon className="w-5 h-5 opacity-50 mb-1" />
          <p className="text-xs text-white/70">Hotels</p>
          <p className="text-2xl font-bold">{stats.hotels}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current transition-all"
            />
          </div>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
          >
            <option>All Genders</option>
            <option>Male Only</option>
            <option>Female Only</option>
            <option>Co-living</option>
          </select>
          <select
            value={filterPropertyType}
            onChange={(e) => setFilterPropertyType(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
          >
            <option>All Types</option>
            <option>PG</option>
            <option>Hotel</option>
          </select>
        </div>
      </div>

      {/* Compact PG Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredListings.map((pg) => (
          <div
            key={pg.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Image Header - Compact */}
            <div className="relative h-32">
              <img src={pg.image} alt={pg.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              
              {/* Compact Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                  pg.status === "Active" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                }`}>
                  {pg.status}
                </span>
                {pg.oneDayStay && (
                  <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-md flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    1-Day
                  </span>
                )}
              </div>
              
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                  pg.propertyType === "Hotel" ? "bg-orange-500 text-white" : "bg-indigo-500 text-white"
                }`}>
                  {pg.propertyType}
                </span>
              </div>

              {/* Name */}
              <div className="absolute bottom-2 left-2 right-2">
                <h3 className="text-sm font-bold text-white truncate">{pg.name}</h3>
                <div className="flex items-center gap-1 text-white/90">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs truncate">{pg.location}</span>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-2">
              {/* Info Row */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                  pg.gender === "Male Only" ? "bg-blue-100 text-blue-800" :
                  pg.gender === "Female Only" ? "bg-pink-100 text-pink-800" :
                  "bg-purple-100 text-purple-800"
                }`}>
                  {pg.gender}
                </span>
                <div className="flex items-center gap-1 text-gray-600">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs">{pg.receptionPhone}</span>
                </div>
              </div>

              {/* Room Types - Compact Table */}
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  Room Pricing
                </p>
                <div className="space-y-1">
                  {pg.roomTypes.slice(0, 2).map((room, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 font-medium">{room.variant}</span>
                      <div className="flex gap-2">
                        {room.priceAC > 0 && (
                          <span className="text-blue-700 font-semibold">
                            AC: ₹{room.priceAC.toLocaleString()}
                          </span>
                        )}
                        {room.priceNonAC > 0 && (
                          <span className="text-gray-700 font-semibold">
                            Non-AC: ₹{room.priceNonAC.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {pg.roomTypes.length > 2 && (
                    <p className="text-xs text-gray-500 text-center">+{pg.roomTypes.length - 2} more</p>
                  )}
                </div>
              </div>

              {/* Amenities - Compact Icons */}
              <div className="flex flex-wrap gap-1">
                {pg.hasGym && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                    <Dumbbell className="w-3 h-3" />
                    <span>Gym</span>
                  </div>
                )}
                {pg.hasAC && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                    <Wind className="w-3 h-3" />
                    <span>AC</span>
                  </div>
                )}
                {pg.hasGamingSpace && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                    <Gamepad2 className="w-3 h-3" />
                    <span>Gaming</span>
                  </div>
                )}
                {pg.hasParking && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                    <Car className="w-3 h-3" />
                    <span>{pg.parkingCapacity}</span>
                  </div>
                )}
                {pg.foodMenu && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
                    <UtensilsCrossed className="w-3 h-3" />
                    <span>Food</span>
                  </div>
                )}
              </div>

              {/* Occupancy - Compact */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Occupancy</span>
                  <span className="text-xs font-semibold text-gray-900">{pg.occupied}/{pg.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      theme === 'blue' ? 'bg-blue-600' : 
                      theme === 'purple' ? 'bg-purple-600' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${(pg.occupied / pg.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons - Compact */}
              <div className="flex gap-1 pt-1">
                <button 
                  onClick={() => openViewModal(pg)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all text-xs font-medium"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>
                <button 
                  onClick={() => openEditModal(pg)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 ${colors.primary} text-white rounded-lg transition-all text-xs font-medium`}
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeletePG(pg.id)}
                  className="px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPG ? "Edit Property" : "Add New Property"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPG(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Property Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Reception Phone *</label>
                    <input
                      type="tel"
                      value={formData.receptionPhone}
                      onChange={(e) => setFormData({...formData, receptionPhone: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Property Type *</label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({...formData, propertyType: e.target.value as "PG" | "Hotel"})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                    >
                      <option>PG</option>
                      <option>Hotel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Gender Type *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                    >
                      <option>Male Only</option>
                      <option>Female Only</option>
                      <option>Co-living</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Total Capacity *</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Currently Occupied</label>
                    <input
                      type="number"
                      value={formData.occupied}
                      onChange={(e) => setFormData({...formData, occupied: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as "Active" | "Inactive"})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Room Types & Pricing with AC/Non-AC */}
              <div className="bg-indigo-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                    <Bed className="w-4 h-4" />
                    Room Types & Pricing (AC / Non-AC)
                  </h3>
                  <button
                    onClick={addRoomType}
                    className={`flex items-center gap-1 px-3 py-1.5 ${colors.primary} text-white rounded-lg text-xs`}
                  >
                    <Plus className="w-3 h-3" />
                    Add Room
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.roomTypes?.map((room, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 grid grid-cols-5 gap-2 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Variant</label>
                        <select
                          value={room.variant}
                          onChange={(e) => updateRoomType(index, "variant", e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-current"
                        >
                          <option>Single</option>
                          <option>2-Share</option>
                          <option>3-Share</option>
                          <option>4-Share</option>
                          <option>5-Share</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">AC Price (₹)</label>
                        <input
                          type="number"
                          value={room.priceAC}
                          onChange={(e) => updateRoomType(index, "priceAC", parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-current"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Non-AC Price (₹)</label>
                        <input
                          type="number"
                          value={room.priceNonAC}
                          onChange={(e) => updateRoomType(index, "priceNonAC", parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-current"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Available</label>
                        <input
                          type="number"
                          value={room.available}
                          onChange={(e) => updateRoomType(index, "available", parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-current"
                          placeholder="0"
                        />
                      </div>
                      <button
                        onClick={() => removeRoomType(index)}
                        className="px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(!formData.roomTypes || formData.roomTypes.length === 0) && (
                    <p className="text-xs text-gray-500 text-center py-3">No room types added yet.</p>
                  )}
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <ImageIcon className="w-4 h-4" />
                  Property Images
                </h3>
                
                {/* Upload Button */}
                <div className="mb-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-indigo-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                    <Upload className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-600">Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1 text-center">Upload multiple images (JPG, PNG, etc.)</p>
                </div>

                {/* Image Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          onClick={() => removeUploadedImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {uploadedImages.length === 0 && (
                  <div className="text-center py-4">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No images uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Amenities - Compact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Amenities</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.hasGym}
                        onChange={(e) => setFormData({...formData, hasGym: e.target.checked})}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <Dumbbell className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Gym</span>
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.hasAC}
                        onChange={(e) => setFormData({...formData, hasAC: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Wind className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">AC Rooms</span>
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.hasNonAC}
                        onChange={(e) => setFormData({...formData, hasNonAC: e.target.checked})}
                        className="w-4 h-4 text-gray-600 rounded"
                      />
                      <Wind className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Non-AC Rooms</span>
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.oneDayStay}
                        onChange={(e) => setFormData({...formData, oneDayStay: e.target.checked})}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">1-Day Stay</span>
                    </label>
                    
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.hasGamingSpace}
                        onChange={(e) => setFormData({...formData, hasGamingSpace: e.target.checked})}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <Gamepad2 className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Gaming Space</span>
                      {formData.hasGamingSpace && (
                        <input
                          type="number"
                          value={formData.gamingSpaceArea}
                          onChange={(e) => setFormData({...formData, gamingSpaceArea: parseInt(e.target.value)})}
                          className="ml-auto w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                          placeholder="sq ft"
                        />
                      )}
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.hasParking}
                        onChange={(e) => setFormData({...formData, hasParking: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <Car className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Parking</span>
                      {formData.hasParking && (
                        <input
                          type="number"
                          value={formData.parkingCapacity}
                          onChange={(e) => setFormData({...formData, parkingCapacity: parseInt(e.target.value)})}
                          className="ml-auto w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                          placeholder="capacity"
                        />
                      )}
                    </label>
                  </div>
                </div>

                {/* Food Menu - Compact */}
                <div className="bg-orange-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                    <UtensilsCrossed className="w-4 h-4" />
                    Food Menu
                  </h3>
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.foodMenu?.breakfast}
                          onChange={(e) => setFormData({
                            ...formData, 
                            foodMenu: {...formData.foodMenu!, breakfast: e.target.checked}
                          })}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <span className="text-gray-700">Breakfast</span>
                      </label>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.foodMenu?.lunch}
                          onChange={(e) => setFormData({
                            ...formData, 
                            foodMenu: {...formData.foodMenu!, lunch: e.target.checked}
                          })}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <span className="text-gray-700">Lunch</span>
                      </label>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.foodMenu?.dinner}
                          onChange={(e) => setFormData({
                            ...formData, 
                            foodMenu: {...formData.foodMenu!, dinner: e.target.checked}
                          })}
                          className="w-4 h-4 text-orange-600 rounded"
                        />
                        <span className="text-gray-700">Dinner</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Menu Details</label>
                      <textarea
                        value={formData.foodMenu?.menuDetails}
                        onChange={(e) => setFormData({
                          ...formData, 
                          foodMenu: {...formData.foodMenu!, menuDetails: e.target.value}
                        })}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-current"
                        rows={3}
                        placeholder="Describe menu..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-2 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPG(null);
                  resetForm();
                }}
                className="px-4 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingPG ? handleEditPG : handleAddPG}
                className={`px-4 py-2 text-sm ${colors.primary} text-white rounded-lg transition-all flex items-center gap-2 font-medium shadow-lg`}
              >
                <Check className="w-4 h-4" />
                {editingPG ? "Update" : "Add Property"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal - Compact */}
      {showViewModal && selectedPG && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Property Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPG(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <img src={selectedPG.image} alt={selectedPG.name} className="w-full h-48 object-cover rounded-xl" />
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedPG.name}</h3>
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{selectedPG.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-semibold">{selectedPG.receptionPhone}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  selectedPG.gender === "Male Only" ? "bg-blue-100 text-blue-800" :
                  selectedPG.gender === "Female Only" ? "bg-pink-100 text-pink-800" :
                  "bg-purple-100 text-purple-800"
                }`}>
                  {selectedPG.gender}
                </span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  selectedPG.propertyType === "Hotel" ? "bg-orange-100 text-orange-800" : "bg-indigo-100 text-indigo-800"
                }`}>
                  {selectedPG.propertyType}
                </span>
              </div>

              {/* Room Types */}
              <div className="bg-indigo-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <Bed className="w-4 h-4" />
                  Room Types & Pricing
                </h4>
                <div className="space-y-2">
                  {selectedPG.roomTypes.map((room, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{room.variant}</span>
                      <div className="flex gap-3">
                        {room.priceAC > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-blue-600">AC Room</p>
                            <p className="text-lg font-bold text-blue-700">₹{room.priceAC.toLocaleString()}</p>
                          </div>
                        )}
                        {room.priceNonAC > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Non-AC Room</p>
                            <p className="text-lg font-bold text-gray-700">₹{room.priceNonAC.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{room.available} available</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-bold text-gray-900 mb-2 text-sm">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPG.hasGym && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
                      <Dumbbell className="w-4 h-4" /> Gym
                    </span>
                  )}
                  {selectedPG.hasAC && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                      <Wind className="w-4 h-4" /> AC
                    </span>
                  )}
                  {selectedPG.hasNonAC && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm">
                      <Wind className="w-4 h-4" /> Non-AC
                    </span>
                  )}
                  {selectedPG.hasGamingSpace && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm">
                      <Gamepad2 className="w-4 h-4" /> Gaming ({selectedPG.gamingSpaceArea} sq ft)
                    </span>
                  )}
                  {selectedPG.hasParking && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-sm">
                      <Car className="w-4 h-4" /> Parking ({selectedPG.parkingCapacity})
                    </span>
                  )}
                </div>
              </div>

              {/* Food Menu */}
              {selectedPG.foodMenu && (
                <div className="bg-orange-50 rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                    <UtensilsCrossed className="w-4 h-4" />
                    Food Menu
                  </h4>
                  <div className="flex gap-2 mb-2">
                    {selectedPG.foodMenu.breakfast && (
                      <span className="px-2 py-1 bg-orange-200 text-orange-900 rounded text-xs font-semibold">✓ Breakfast</span>
                    )}
                    {selectedPG.foodMenu.lunch && (
                      <span className="px-2 py-1 bg-orange-200 text-orange-900 rounded text-xs font-semibold">✓ Lunch</span>
                    )}
                    {selectedPG.foodMenu.dinner && (
                      <span className="px-2 py-1 bg-orange-200 text-orange-900 rounded text-xs font-semibold">✓ Dinner</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{selectedPG.foodMenu.menuDetails}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}