import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { drugAPI } from "../services/api"
import { socketService } from "../services/socket"
import { useAuthStore } from "../store/authStore"
import {
  Search,
  Plus,
  Package,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  QrCode,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { format } from "date-fns"
import clsx from "clsx"
import toast from "react-hot-toast"

const categories = [
  { value: "", label: "All Categories" },
  { value: "antibiotics", label: "Antibiotics" },
  { value: "painkillers", label: "Painkillers" },
  { value: "cardiovascular", label: "Cardiovascular" },
  { value: "respiratory", label: "Respiratory" },
  { value: "diabetes", label: "Diabetes" },
  { value: "vitamins", label: "Vitamins" },
  { value: "vaccines", label: "Vaccines" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
]

const locations = [
  { value: "", label: "All Locations" },
  { value: "central-warehouse", label: "Central Warehouse" },
  { value: "city-hospital", label: "City Hospital" },
  { value: "district-pharmacy", label: "District Pharmacy" },
  { value: "mobile-unit", label: "Mobile Unit" },
]

export default function Inventory() {
  const [drugs, setDrugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState("list")
  const [actionMenu, setActionMenu] = useState(null)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchDrugs()

    const unsubscribe = socketService.on("stockUpdated", () => {
      fetchDrugs()
    })

    return unsubscribe
  }, [category, location, status])

  const fetchDrugs = async () => {
    try {
      const params = {}
      if (category) params.category = category
      if (location) params.location = location
      if (status) params.status = status
      if (search) params.search = search

      const { data } = await drugAPI.getAll(params)
      setDrugs(data.drugs)
    } catch (error) {
      toast.error("Failed to fetch drugs")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchDrugs()
  }

  const handleDelete = async (drugId) => {
    if (!window.confirm("Are you sure you want to delete this drug?")) return

    try {
      await drugAPI.delete(drugId)
      toast.success("Drug deleted successfully")
      fetchDrugs()
    } catch (error) {
      toast.error("Failed to delete drug")
    }
    setActionMenu(null)
  }

  const clearFilters = () => {
    setCategory("")
    setLocation("")
    setStatus("")
    setSearch("")
  }

  const hasActiveFilters = category || location || status || search

  const getStockStatusBadge = (drug) => {
    const status = drug.stockStatus
    const badges = {
      "out-of-stock": { class: "badge-error", label: "Out of Stock", icon: AlertTriangle },
      "low-stock": { class: "badge-warning", label: "Low Stock", icon: AlertTriangle },
      overstocked: { class: "badge-info", label: "Overstocked", icon: Package },
      "in-stock": { class: "badge-success", label: "In Stock", icon: Package },
    }
    const badge = badges[status] || badges["in-stock"]
    return (
      <span className={clsx("badge", badge.class)}>
        <badge.icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  const getExpiryStatus = (drug) => {
    const days = drug.daysUntilExpiry
    if (days <= 0) return { class: "text-red-600 bg-red-50", label: "Expired" }
    if (days <= 7) return { class: "text-red-500 bg-red-50", label: `${days}d left` }
    if (days <= 30) return { class: "text-amber-500 bg-amber-50", label: `${days}d left` }
    return { class: "text-slate-500 bg-slate-50", label: format(new Date(drug.expiryDate), "MMM d, yyyy") }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Manage your drug inventory ({drugs.length} items)</p>
        </div>
        {["admin", "warehouse"].includes(user?.role) && (
          <button onClick={() => navigate("/inventory/add")} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add New Drug
          </button>
        )}
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-12 pr-4"
              placeholder="Search drugs by name, ID, or batch..."
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={clsx("btn relative", showFilters ? "btn-primary" : "btn-secondary")}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full" />}
            </button>
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700",
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={clsx(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700",
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 animate-fade-in">
            <div>
              <label className="label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className="input">
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Stock Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
                <option value="">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex items-end">
              {hasActiveFilters && (
                <button type="button" onClick={clearFilters} className="btn btn-ghost text-slate-500">
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 skeleton rounded-2xl" />
          ))}
        </div>
      ) : drugs.length === 0 ? (
        <div className="card empty-state">
          <Package className="empty-state-icon" />
          <h3 className="text-lg font-semibold text-slate-900">No drugs found</h3>
          <p className="text-slate-500 mt-1 max-w-sm">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-secondary mt-4">
              Clear filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drugs.map((drug, index) => {
            const expiryStatus = getExpiryStatus(drug)
            return (
              <div
                key={drug._id}
                className="card card-hover cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => navigate(`/inventory/${drug._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary-100 rounded-xl">
                    <Package className="w-6 h-6 text-primary-600" />
                  </div>
                  {getStockStatusBadge(drug)}
                </div>
                <h3 className="font-bold text-slate-900 text-lg truncate">{drug.name}</h3>
                <p className="text-sm text-slate-500 truncate">
                  {drug.drugId} - Batch: {drug.batchNo}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="badge bg-slate-100 text-slate-600 capitalize">{drug.category}</span>
                  <span className={clsx("badge", expiryStatus.class)}>
                    <Clock className="w-3 h-3" />
                    {expiryStatus.label}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{drug.quantity}</p>
                    <p className="text-xs text-slate-500">{drug.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">${drug.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">per unit</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {drugs.map((drug, index) => {
            const expiryStatus = getExpiryStatus(drug)
            return (
              <div
                key={drug._id}
                className="card card-hover cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => navigate(`/inventory/${drug._id}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Drug Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl shrink-0">
                        <Package className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-lg truncate">{drug.name}</h3>
                        <p className="text-sm text-slate-500">
                          {drug.drugId} - Batch: {drug.batchNo}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {getStockStatusBadge(drug)}
                          <span className="badge bg-slate-100 text-slate-600 capitalize">{drug.category}</span>
                          <span className="badge bg-slate-100 text-slate-600 capitalize">
                            {drug.location.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8 lg:gap-10">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{drug.quantity.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">{drug.unit}</p>
                    </div>
                    <div className="text-center">
                      <p className={clsx("text-sm font-semibold px-2 py-1 rounded-lg", expiryStatus.class)}>
                        {expiryStatus.label}
                      </p>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Expiry</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">${drug.price.toFixed(2)}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Per Unit</p>
                    </div>

                    {/* Actions */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setActionMenu(actionMenu === drug._id ? null : drug._id)
                        }}
                        className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>

                      {actionMenu === drug._id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActionMenu(null)
                            }}
                          />
                          <div className="absolute right-0 z-50 mt-2 w-48 py-2 bg-white rounded-2xl shadow-xl border border-slate-200 animate-scale-in origin-top-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/inventory/${drug._id}`)
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/inventory/${drug._id}?edit=true`)
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Drug
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/inventory/${drug._id}?qr=true`)
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                              View QR Code
                            </button>
                            {["admin"].includes(user?.role) && (
                              <>
                                <div className="my-1 border-t border-slate-100" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(drug._id)
                                  }}
                                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Drug
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { drugAPI } from "../services/api"
// import { socketService } from "../services/socket"
// import { useAuthStore } from "../store/authStore"
// import { Search, Filter, Plus, Package, MoreVertical, Eye, Edit, Trash2, QrCode } from "lucide-react"
// import { format } from "date-fns"
// import clsx from "clsx"
// import toast from "react-hot-toast"

// const categories = [
//   { value: "", label: "All Categories" },
//   { value: "antibiotics", label: "Antibiotics" },
//   { value: "painkillers", label: "Painkillers" },
//   { value: "cardiovascular", label: "Cardiovascular" },
//   { value: "respiratory", label: "Respiratory" },
//   { value: "diabetes", label: "Diabetes" },
//   { value: "vitamins", label: "Vitamins" },
//   { value: "vaccines", label: "Vaccines" },
//   { value: "emergency", label: "Emergency" },
//   { value: "other", label: "Other" },
// ]

// const locations = [
//   { value: "", label: "All Locations" },
//   { value: "central-warehouse", label: "Central Warehouse" },
//   { value: "city-hospital", label: "City Hospital" },
//   { value: "district-pharmacy", label: "District Pharmacy" },
//   { value: "mobile-unit", label: "Mobile Unit" },
// ]

// export default function Inventory() {
//   const [drugs, setDrugs] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [search, setSearch] = useState("")
//   const [category, setCategory] = useState("")
//   const [location, setLocation] = useState("")
//   const [status, setStatus] = useState("")
//   const [showFilters, setShowFilters] = useState(false)
//   const [actionMenu, setActionMenu] = useState(null)
//   const { user } = useAuthStore()
//   const navigate = useNavigate()

//   useEffect(() => {
//     fetchDrugs()

//     const unsubscribe = socketService.on("stockUpdated", () => {
//       fetchDrugs()
//     })

//     return unsubscribe
//   }, [category, location, status])

//   const fetchDrugs = async () => {
//     try {
//       const params = {}
//       if (category) params.category = category
//       if (location) params.location = location
//       if (status) params.status = status
//       if (search) params.search = search

//       const { data } = await drugAPI.getAll(params)
//       setDrugs(data.drugs)
//     } catch (error) {
//       toast.error("Failed to fetch drugs")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSearch = (e) => {
//     e.preventDefault()
//     fetchDrugs()
//   }

//   const handleDelete = async (drugId) => {
//     if (!window.confirm("Are you sure you want to delete this drug?")) return

//     try {
//       await drugAPI.delete(drugId)
//       toast.success("Drug deleted successfully")
//       fetchDrugs()
//     } catch (error) {
//       toast.error("Failed to delete drug")
//     }
//     setActionMenu(null)
//   }

//   const getStockStatusBadge = (drug) => {
//     const status = drug.stockStatus
//     const badges = {
//       "out-of-stock": { class: "badge-error", label: "Out of Stock" },
//       "low-stock": { class: "badge-warning", label: "Low Stock" },
//       overstocked: { class: "badge-info", label: "Overstocked" },
//       "in-stock": { class: "badge-success", label: "In Stock" },
//     }
//     const badge = badges[status] || badges["in-stock"]
//     return <span className={clsx("badge", badge.class)}>{badge.label}</span>
//   }

//   const getExpiryStatus = (drug) => {
//     const days = drug.daysUntilExpiry
//     if (days <= 0) return { class: "text-red-600", label: "Expired" }
//     if (days <= 7) return { class: "text-red-500", label: `${days}d left` }
//     if (days <= 30) return { class: "text-amber-500", label: `${days}d left` }
//     return { class: "text-slate-500", label: format(new Date(drug.expiryDate), "MMM d, yyyy") }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
//           <p className="text-slate-500">Manage your drug inventory</p>
//         </div>
//         {["admin", "warehouse"].includes(user?.role) && (
//           <button onClick={() => navigate("/inventory/add")} className="btn btn-primary">
//             <Plus className="w-4 h-4" />
//             Add New Drug
//           </button>
//         )}
//       </div>

//       {/* Search and Filters */}
//       <div className="card">
//         <form onSubmit={handleSearch} className="flex gap-3">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="input pl-10"
//               placeholder="Search drugs by name, ID, or batch..."
//             />
//           </div>
//           <button type="submit" className="btn btn-primary">
//             Search
//           </button>
//           <button
//             type="button"
//             onClick={() => setShowFilters(!showFilters)}
//             className={clsx("btn", showFilters ? "btn-primary" : "btn-secondary")}
//           >
//             <Filter className="w-4 h-4" />
//             Filters
//           </button>
//         </form>

//         {showFilters && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
//             <div>
//               <label className="label">Category</label>
//               <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
//                 {categories.map((cat) => (
//                   <option key={cat.value} value={cat.value}>
//                     {cat.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="label">Location</label>
//               <select value={location} onChange={(e) => setLocation(e.target.value)} className="input">
//                 {locations.map((loc) => (
//                   <option key={loc.value} value={loc.value}>
//                     {loc.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="label">Stock Status</label>
//               <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
//                 <option value="">All Status</option>
//                 <option value="in-stock">In Stock</option>
//                 <option value="low-stock">Low Stock</option>
//                 <option value="out-of-stock">Out of Stock</option>
//               </select>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Drug List */}
//       {loading ? (
//         <div className="flex items-center justify-center py-12">
//           <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
//         </div>
//       ) : drugs.length === 0 ? (
//         <div className="card text-center py-12">
//           <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-slate-900">No drugs found</h3>
//           <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
//         </div>
//       ) : (
//         <div className="grid gap-4">
//           {drugs.map((drug) => {
//             const expiryStatus = getExpiryStatus(drug)
//             return (
//               <div
//                 key={drug._id}
//                 className="card hover:shadow-md transition-shadow cursor-pointer"
//                 onClick={() => navigate(`/inventory/${drug._id}`)}
//               >
//                 <div className="flex flex-col lg:flex-row lg:items-center gap-4">
//                   {/* Drug Info */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start gap-3">
//                       <div className="p-2 bg-primary-100 rounded-lg">
//                         <Package className="w-5 h-5 text-primary-600" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h3 className="font-semibold text-slate-900 truncate">{drug.name}</h3>
//                         <p className="text-sm text-slate-500">
//                           {drug.drugId} • Batch: {drug.batchNo}
//                         </p>
//                         <div className="flex flex-wrap items-center gap-2 mt-2">
//                           {getStockStatusBadge(drug)}
//                           <span className="badge bg-slate-100 text-slate-600 capitalize">{drug.category}</span>
//                           <span className="badge bg-slate-100 text-slate-600 capitalize">
//                             {drug.location.replace("-", " ")}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Stats */}
//                   <div className="flex items-center gap-6 lg:gap-8">
//                     <div className="text-center">
//                       <p className="text-2xl font-bold text-slate-900">{drug.quantity}</p>
//                       <p className="text-xs text-slate-500">{drug.unit}</p>
//                     </div>
//                     <div className="text-center">
//                       <p className={clsx("text-sm font-medium", expiryStatus.class)}>{expiryStatus.label}</p>
//                       <p className="text-xs text-slate-500">Expiry</p>
//                     </div>
//                     <div className="text-center">
//                       <p className="text-sm font-medium text-slate-900">${drug.price.toFixed(2)}</p>
//                       <p className="text-xs text-slate-500">per unit</p>
//                     </div>

//                     {/* Actions */}
//                     <div className="relative">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation()
//                           setActionMenu(actionMenu === drug._id ? null : drug._id)
//                         }}
//                         className="p-2 hover:bg-slate-100 rounded-lg"
//                       >
//                         <MoreVertical className="w-5 h-5 text-slate-400" />
//                       </button>

//                       {actionMenu === drug._id && (
//                         <>
//                           <div
//                             className="fixed inset-0 z-40"
//                             onClick={(e) => {
//                               e.stopPropagation()
//                               setActionMenu(null)
//                             }}
//                           />
//                           <div className="absolute right-0 z-50 mt-1 w-48 py-1 bg-white rounded-lg shadow-lg border border-slate-200">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 navigate(`/inventory/${drug._id}`)
//                               }}
//                               className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
//                             >
//                               <Eye className="w-4 h-4" />
//                               View Details
//                             </button>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 navigate(`/inventory/${drug._id}?edit=true`)
//                               }}
//                               className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
//                             >
//                               <Edit className="w-4 h-4" />
//                               Edit
//                             </button>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation()
//                                 navigate(`/inventory/${drug._id}?qr=true`)
//                               }}
//                               className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
//                             >
//                               <QrCode className="w-4 h-4" />
//                               View QR Code
//                             </button>
//                             {["admin"].includes(user?.role) && (
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation()
//                                   handleDelete(drug._id)
//                                 }}
//                                 className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                               >
//                                 <Trash2 className="w-4 h-4" />
//                                 Delete
//                               </button>
//                             )}
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }
