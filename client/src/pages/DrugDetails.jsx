import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { drugAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { QRCodeSVG } from "qrcode.react";
import {
	ArrowLeft,
	Package,
	Calendar,
	MapPin,
	Building,
	DollarSign,
	Thermometer,
	Edit,
	Save,
	X,
	Download,
	RefreshCw,
	AlertTriangle,
	CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";
import toast from "react-hot-toast";

export default function DrugDetails() {
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { user } = useAuthStore();

	const [drug, setDrug] = useState(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(searchParams.get("edit") === "true");
	const [showQR, setShowQR] = useState(searchParams.get("qr") === "true");
	const [formData, setFormData] = useState({});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		fetchDrug();
	}, [id]);

	const fetchDrug = async () => {
		try {
			const { data } = await drugAPI.getById(id);
			setDrug(data.drug);
			setFormData(data.drug);
		} catch (error) {
			toast.error("Failed to fetch drug details");
			navigate("/inventory");
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const { data } = await drugAPI.update(id, formData);
			setDrug(data.drug);
			setEditing(false);
			toast.success("Drug updated successfully");
		} catch (error) {
			toast.error("Failed to update drug");
		} finally {
			setSaving(false);
		}
	};

	const handleRegenerateQR = async () => {
		try {
			const { data } = await drugAPI.regenerateQR(id);
			setDrug({ ...drug, qrCode: data.qrCode });
			toast.success("QR Code regenerated");
		} catch (error) {
			toast.error("Failed to regenerate QR code");
		}
	};

	const downloadQR = () => {
		const svg = document.getElementById("drug-qr-code");
		const svgData = new XMLSerializer().serializeToString(svg);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);
			const pngFile = canvas.toDataURL("image/png");
			const downloadLink = document.createElement("a");
			downloadLink.download = `${drug.drugId}-qr.png`;
			downloadLink.href = pngFile;
			downloadLink.click();
		};
		img.src = "data:image/svg+xml;base64," + btoa(svgData);
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-16 skeleton rounded-2xl" />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<div className="h-64 skeleton rounded-2xl" />
						<div className="h-40 skeleton rounded-2xl" />
					</div>
					<div className="h-80 skeleton rounded-2xl" />
				</div>
			</div>
		);
	}

	if (!drug) return null;

	const getStockStatusConfig = () => {
		const status = drug.stockStatus;
		const configs = {
			"out-of-stock": {
				class: "badge-error",
				label: "Out of Stock",
				icon: AlertTriangle,
			},
			"low-stock": {
				class: "badge-warning",
				label: "Low Stock",
				icon: AlertTriangle,
			},
			overstocked: { class: "badge-info", label: "Overstocked", icon: Package },
			"in-stock": {
				class: "badge-success",
				label: "In Stock",
				icon: CheckCircle,
			},
		};
		return configs[status] || configs["in-stock"];
	};

	const stockConfig = getStockStatusConfig();

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<button
					onClick={() => navigate("/inventory")}
					className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold text-slate-900">{drug.name}</h1>
						<span className={clsx("badge", stockConfig.class)}>
							<stockConfig.icon className="w-3 h-3" />
							{stockConfig.label}
						</span>
					</div>
					<p className="text-slate-500">{drug.drugId}</p>
				</div>
				<div className="flex gap-2">
					{["admin", "warehouse"].includes(user?.role) && !editing && (
						<button
							onClick={() => setEditing(true)}
							className="btn btn-secondary"
						>
							<Edit className="w-4 h-4" />
							Edit
						</button>
					)}
					<button
						onClick={() => setShowQR(!showQR)}
						className={clsx("btn", showQR ? "btn-primary" : "btn-secondary")}
					>
						QR Code
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Info */}
				<div className="lg:col-span-2 space-y-6">
					<div className="card">
						<h2 className="text-lg font-bold text-slate-900 mb-6">
							Drug Information
						</h2>

						{editing ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="label">Name</label>
									<input
										type="text"
										value={formData.name || ""}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										className="input"
									/>
								</div>
								<div>
									<label className="label">Generic Name</label>
									<input
										type="text"
										value={formData.genericName || ""}
										onChange={(e) =>
											setFormData({ ...formData, genericName: e.target.value })
										}
										className="input"
									/>
								</div>
								<div>
									<label className="label">Category</label>
									<select
										value={formData.category || ""}
										onChange={(e) =>
											setFormData({ ...formData, category: e.target.value })
										}
										className="input"
									>
										<option value="antibiotics">Antibiotics</option>
										<option value="painkillers">Painkillers</option>
										<option value="cardiovascular">Cardiovascular</option>
										<option value="respiratory">Respiratory</option>
										<option value="diabetes">Diabetes</option>
										<option value="vitamins">Vitamins</option>
										<option value="vaccines">Vaccines</option>
										<option value="emergency">Emergency</option>
										<option value="other">Other</option>
									</select>
								</div>
								<div>
									<label className="label">Quantity</label>
									<input
										type="number"
										value={formData.quantity || 0}
										onChange={(e) =>
											setFormData({
												...formData,
												quantity: Number.parseInt(e.target.value),
											})
										}
										className="input"
									/>
								</div>
								<div>
									<label className="label">Price per Unit</label>
									<input
										type="number"
										step="0.01"
										value={formData.price || 0}
										onChange={(e) =>
											setFormData({
												...formData,
												price: Number.parseFloat(e.target.value),
											})
										}
										className="input"
									/>
								</div>
								<div>
									<label className="label">Location</label>
									<select
										value={formData.location || ""}
										onChange={(e) =>
											setFormData({ ...formData, location: e.target.value })
										}
										className="input"
									>
										<option value="central-warehouse">Central Warehouse</option>
										<option value="city-hospital">City Hospital</option>
										<option value="district-pharmacy">District Pharmacy</option>
										<option value="mobile-unit">Mobile Unit</option>
									</select>
								</div>
								<div className="md:col-span-2">
									<label className="label">Description</label>
									<textarea
										value={formData.description || ""}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										className="input min-h-[100px]"
										rows={3}
									/>
								</div>
								<div className="md:col-span-2 flex gap-3 pt-4">
									<button
										onClick={handleSave}
										disabled={saving}
										className="btn btn-primary"
									>
										{saving ? (
											<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										) : (
											<Save className="w-4 h-4" />
										)}
										{saving ? "Saving..." : "Save Changes"}
									</button>
									<button
										onClick={() => setEditing(false)}
										className="btn btn-secondary"
									>
										<X className="w-4 h-4" />
										Cancel
									</button>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<InfoItem
									icon={Package}
									label="Batch Number"
									value={drug.batchNo}
								/>
								<InfoItem
									icon={Package}
									label="Category"
									value={drug.category}
								/>
								<InfoItem
									icon={Building}
									label="Manufacturer"
									value={drug.manufacturer}
								/>
								<InfoItem
									icon={Building}
									label="Supplier"
									value={drug.supplier}
								/>
								<InfoItem
									icon={Calendar}
									label="Manufacture Date"
									value={format(new Date(drug.manufactureDate), "MMM d, yyyy")}
								/>
								<InfoItem
									icon={Calendar}
									label="Expiry Date"
									value={format(new Date(drug.expiryDate), "MMM d, yyyy")}
									highlight={drug.daysUntilExpiry <= 30}
								/>
								<InfoItem
									icon={MapPin}
									label="Location"
									value={drug.location.replace("-", " ")}
								/>
								<InfoItem
									icon={Thermometer}
									label="Storage"
									value={drug.storageCondition.replace("-", " ")}
								/>
								<InfoItem
									icon={DollarSign}
									label="Price per Unit"
									value={`$${drug.price.toFixed(2)}`}
								/>
								<InfoItem icon={Package} label="Unit" value={drug.unit} />
							</div>
						)}
					</div>

					<div className="card">
						<h2 className="text-lg font-bold text-slate-900 mb-6">
							Stock Information
						</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="text-center p-5 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl">
								<p className="text-3xl font-bold text-primary-600">
									{drug.quantity.toLocaleString()}
								</p>
								<p className="text-sm text-primary-600/70 font-medium mt-1">
									Current Stock
								</p>
							</div>
							<div className="text-center p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl">
								<p className="text-3xl font-bold text-amber-600">
									{drug.minThreshold}
								</p>
								<p className="text-sm text-amber-600/70 font-medium mt-1">
									Min Threshold
								</p>
							</div>
							<div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl">
								<p className="text-3xl font-bold text-blue-600">
									{drug.maxThreshold}
								</p>
								<p className="text-sm text-blue-600/70 font-medium mt-1">
									Max Threshold
								</p>
							</div>
							<div className="text-center p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl">
								<p className="text-3xl font-bold text-emerald-600">
									${(drug.quantity * drug.price).toLocaleString()}
								</p>
								<p className="text-sm text-emerald-600/70 font-medium mt-1">
									Total Value
								</p>
							</div>
						</div>

						{/* Stock level indicator */}
						<div className="mt-6 pt-6 border-t border-slate-100">
							<div className="flex items-center justify-between text-sm mb-2">
								<span className="text-slate-500">Stock Level</span>
								<span className="font-medium text-slate-700">
									{Math.round((drug.quantity / drug.maxThreshold) * 100)}%
								</span>
							</div>
							<div className="h-3 bg-slate-100 rounded-full overflow-hidden">
								<div
									className={clsx(
										"h-full rounded-full transition-all duration-500",
										drug.quantity <= drug.minThreshold
											? "bg-red-500"
											: drug.quantity >= drug.maxThreshold
											? "bg-blue-500"
											: "bg-emerald-500"
									)}
									style={{
										width: `${Math.min(
											(drug.quantity / drug.maxThreshold) * 100,
											100
										)}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				{showQR && (
					<div className="card h-fit animate-fade-in">
						<h2 className="text-lg font-bold text-slate-900 mb-6">QR Code</h2>
						<div className="flex flex-col items-center">
							<div className="p-6 bg-white border-2 border-slate-100 rounded-2xl shadow-inner">
								<QRCodeSVG
									id="drug-qr-code"
									value={JSON.stringify({
										drugId: drug.drugId,
										name: drug.name,
										batchNo: drug.batchNo,
										expiryDate: drug.expiryDate,
										location: drug.location,
									})}
									size={180}
									level="H"
								/>
							</div>
							<p className="text-sm text-slate-500 mt-4 text-center max-w-[200px]">
								Scan this QR code to quickly access drug information
							</p>
							<div className="flex gap-2 mt-4 w-full">
								<button
									onClick={downloadQR}
									className="btn btn-secondary flex-1"
								>
									<Download className="w-4 h-4" />
									Download
								</button>
								<button
									onClick={handleRegenerateQR}
									className="btn btn-secondary flex-1"
								>
									<RefreshCw className="w-4 h-4" />
									Regenerate
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function InfoItem({ icon: Icon, label, value, highlight }) {
	return (
		<div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
			<div className="p-2 bg-white rounded-lg shadow-sm">
				<Icon className="w-4 h-4 text-slate-500" />
			</div>
			<div>
				<p className="text-sm text-slate-500">{label}</p>
				<p
					className={clsx(
						"font-semibold capitalize",
						highlight ? "text-red-600" : "text-slate-900"
					)}
				>
					{value}
				</p>
			</div>
		</div>
	);
}

// import { useState, useEffect } from "react"
// import { useParams, useNavigate, useSearchParams } from "react-router-dom"
// import { drugAPI } from "../services/api"
// import { useAuthStore } from "../store/authStore"
// import { QRCodeSVG } from "qrcode.react"
// import {
//   ArrowLeft,
//   Package,
//   Calendar,
//   MapPin,
//   Building,
//   DollarSign,
//   Thermometer,
//   Edit,
//   Save,
//   X,
//   Download,
//   RefreshCw,
// } from "lucide-react"
// import { format } from "date-fns"
// import clsx from "clsx"
// import toast from "react-hot-toast"

// export default function DrugDetails() {
//   const { id } = useParams()
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const { user } = useAuthStore()

//   const [drug, setDrug] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [editing, setEditing] = useState(searchParams.get("edit") === "true")
//   const [showQR, setShowQR] = useState(searchParams.get("qr") === "true")
//   const [formData, setFormData] = useState({})
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     fetchDrug()
//   }, [id])

//   const fetchDrug = async () => {
//     try {
//       const { data } = await drugAPI.getById(id)
//       setDrug(data.drug)
//       setFormData(data.drug)
//     } catch (error) {
//       toast.error("Failed to fetch drug details")
//       navigate("/inventory")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSave = async () => {
//     setSaving(true)
//     try {
//       const { data } = await drugAPI.update(id, formData)
//       setDrug(data.drug)
//       setEditing(false)
//       toast.success("Drug updated successfully")
//     } catch (error) {
//       toast.error("Failed to update drug")
//     } finally {
//       setSaving(false)
//     }
//   }

//   const handleRegenerateQR = async () => {
//     try {
//       const { data } = await drugAPI.regenerateQR(id)
//       setDrug({ ...drug, qrCode: data.qrCode })
//       toast.success("QR Code regenerated")
//     } catch (error) {
//       toast.error("Failed to regenerate QR code")
//     }
//   }

//   const downloadQR = () => {
//     const svg = document.getElementById("drug-qr-code")
//     const svgData = new XMLSerializer().serializeToString(svg)
//     const canvas = document.createElement("canvas")
//     const ctx = canvas.getContext("2d")
//     const img = new Image()
//     img.onload = () => {
//       canvas.width = img.width
//       canvas.height = img.height
//       ctx.fillStyle = "white"
//       ctx.fillRect(0, 0, canvas.width, canvas.height)
//       ctx.drawImage(img, 0, 0)
//       const pngFile = canvas.toDataURL("image/png")
//       const downloadLink = document.createElement("a")
//       downloadLink.download = `${drug.drugId}-qr.png`
//       downloadLink.href = pngFile
//       downloadLink.click()
//     }
//     img.src = "data:image/svg+xml;base64," + btoa(svgData)
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
//       </div>
//     )
//   }

//   if (!drug) return null

//   const getStockStatusBadge = () => {
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

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <button onClick={() => navigate("/inventory")} className="p-2 hover:bg-slate-100 rounded-lg">
//           <ArrowLeft className="w-5 h-5" />
//         </button>
//         <div className="flex-1">
//           <h1 className="text-2xl font-bold text-slate-900">{drug.name}</h1>
//           <p className="text-slate-500">{drug.drugId}</p>
//         </div>
//         <div className="flex gap-2">
//           {["admin", "warehouse"].includes(user?.role) && !editing && (
//             <button onClick={() => setEditing(true)} className="btn btn-secondary">
//               <Edit className="w-4 h-4" />
//               Edit
//             </button>
//           )}
//           <button onClick={() => setShowQR(!showQR)} className="btn btn-secondary">
//             QR Code
//           </button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Main Info */}
//         <div className="lg:col-span-2 space-y-6">
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-semibold text-slate-900">Drug Information</h2>
//               {getStockStatusBadge()}
//             </div>

//             {editing ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="label">Name</label>
//                   <input
//                     type="text"
//                     value={formData.name || ""}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="input"
//                   />
//                 </div>
//                 <div>
//                   <label className="label">Generic Name</label>
//                   <input
//                     type="text"
//                     value={formData.genericName || ""}
//                     onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
//                     className="input"
//                   />
//                 </div>
//                 <div>
//                   <label className="label">Category</label>
//                   <select
//                     value={formData.category || ""}
//                     onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                     className="input"
//                   >
//                     <option value="antibiotics">Antibiotics</option>
//                     <option value="painkillers">Painkillers</option>
//                     <option value="cardiovascular">Cardiovascular</option>
//                     <option value="respiratory">Respiratory</option>
//                     <option value="diabetes">Diabetes</option>
//                     <option value="vitamins">Vitamins</option>
//                     <option value="vaccines">Vaccines</option>
//                     <option value="emergency">Emergency</option>
//                     <option value="other">Other</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="label">Quantity</label>
//                   <input
//                     type="number"
//                     value={formData.quantity || 0}
//                     onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) })}
//                     className="input"
//                   />
//                 </div>
//                 <div>
//                   <label className="label">Price per Unit</label>
//                   <input
//                     type="number"
//                     step="0.01"
//                     value={formData.price || 0}
//                     onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
//                     className="input"
//                   />
//                 </div>
//                 <div>
//                   <label className="label">Location</label>
//                   <select
//                     value={formData.location || ""}
//                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                     className="input"
//                   >
//                     <option value="central-warehouse">Central Warehouse</option>
//                     <option value="city-hospital">City Hospital</option>
//                     <option value="district-pharmacy">District Pharmacy</option>
//                     <option value="mobile-unit">Mobile Unit</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="label">Min Threshold</label>
//                   <input
//                     type="number"
//                     value={formData.minThreshold || 0}
//                     onChange={(e) => setFormData({ ...formData, minThreshold: Number.parseInt(e.target.value) })}
//                     className="input"
//                   />
//                 </div>
//                 <div>
//                   <label className="label">Max Threshold</label>
//                   <input
//                     type="number"
//                     value={formData.maxThreshold || 0}
//                     onChange={(e) => setFormData({ ...formData, maxThreshold: Number.parseInt(e.target.value) })}
//                     className="input"
//                   />
//                 </div>
//                 <div className="md:col-span-2">
//                   <label className="label">Description</label>
//                   <textarea
//                     value={formData.description || ""}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     className="input"
//                     rows={3}
//                   />
//                 </div>
//                 <div className="md:col-span-2 flex gap-3">
//                   <button onClick={handleSave} disabled={saving} className="btn btn-primary">
//                     <Save className="w-4 h-4" />
//                     {saving ? "Saving..." : "Save Changes"}
//                   </button>
//                   <button onClick={() => setEditing(false)} className="btn btn-secondary">
//                     <X className="w-4 h-4" />
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <InfoItem icon={Package} label="Batch Number" value={drug.batchNo} />
//                 <InfoItem icon={Package} label="Category" value={drug.category} />
//                 <InfoItem icon={Building} label="Manufacturer" value={drug.manufacturer} />
//                 <InfoItem icon={Building} label="Supplier" value={drug.supplier} />
//                 <InfoItem
//                   icon={Calendar}
//                   label="Manufacture Date"
//                   value={format(new Date(drug.manufactureDate), "MMM d, yyyy")}
//                 />
//                 <InfoItem
//                   icon={Calendar}
//                   label="Expiry Date"
//                   value={format(new Date(drug.expiryDate), "MMM d, yyyy")}
//                   highlight={drug.daysUntilExpiry <= 30}
//                 />
//                 <InfoItem icon={MapPin} label="Location" value={drug.location.replace("-", " ")} />
//                 <InfoItem icon={Thermometer} label="Storage" value={drug.storageCondition.replace("-", " ")} />
//                 <InfoItem icon={DollarSign} label="Price per Unit" value={`$${drug.price.toFixed(2)}`} />
//                 <InfoItem icon={Package} label="Unit" value={drug.unit} />
//               </div>
//             )}
//           </div>

//           {/* Stock Info */}
//           <div className="card">
//             <h2 className="text-lg font-semibold text-slate-900 mb-4">Stock Information</h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center p-4 bg-slate-50 rounded-lg">
//                 <p className="text-3xl font-bold text-slate-900">{drug.quantity}</p>
//                 <p className="text-sm text-slate-500">Current Stock</p>
//               </div>
//               <div className="text-center p-4 bg-slate-50 rounded-lg">
//                 <p className="text-3xl font-bold text-slate-900">{drug.minThreshold}</p>
//                 <p className="text-sm text-slate-500">Min Threshold</p>
//               </div>
//               <div className="text-center p-4 bg-slate-50 rounded-lg">
//                 <p className="text-3xl font-bold text-slate-900">{drug.maxThreshold}</p>
//                 <p className="text-sm text-slate-500">Max Threshold</p>
//               </div>
//               <div className="text-center p-4 bg-slate-50 rounded-lg">
//                 <p className="text-3xl font-bold text-slate-900">${(drug.quantity * drug.price).toFixed(0)}</p>
//                 <p className="text-sm text-slate-500">Total Value</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* QR Code Sidebar */}
//         {showQR && (
//           <div className="card">
//             <h2 className="text-lg font-semibold text-slate-900 mb-4">QR Code</h2>
//             <div className="flex flex-col items-center">
//               <div className="p-4 bg-white border border-slate-200 rounded-lg">
//                 <QRCodeSVG
//                   id="drug-qr-code"
//                   value={JSON.stringify({
//                     drugId: drug.drugId,
//                     name: drug.name,
//                     batchNo: drug.batchNo,
//                     expiryDate: drug.expiryDate,
//                     location: drug.location,
//                   })}
//                   size={200}
//                   level="H"
//                 />
//               </div>
//               <p className="text-sm text-slate-500 mt-4 text-center">
//                 Scan this QR code to quickly access drug information
//               </p>
//               <div className="flex gap-2 mt-4">
//                 <button onClick={downloadQR} className="btn btn-secondary">
//                   <Download className="w-4 h-4" />
//                   Download
//                 </button>
//                 <button onClick={handleRegenerateQR} className="btn btn-secondary">
//                   <RefreshCw className="w-4 h-4" />
//                   Regenerate
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// function InfoItem({ icon: Icon, label, value, highlight }) {
//   return (
//     <div className="flex items-start gap-3">
//       <div className="p-2 bg-slate-100 rounded-lg">
//         <Icon className="w-4 h-4 text-slate-600" />
//       </div>
//       <div>
//         <p className="text-sm text-slate-500">{label}</p>
//         <p className={clsx("font-medium capitalize", highlight ? "text-red-600" : "text-slate-900")}>{value}</p>
//       </div>
//     </div>
//   )
// }
