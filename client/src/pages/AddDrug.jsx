import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { drugAPI } from "../services/api";
import {
	ArrowLeft,
	Save,
	Package,
	Calendar,
	DollarSign,
	FileText,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AddDrug() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		genericName: "",
		category: "other",
		batchNo: "",
		quantity: 0,
		unit: "tablets",
		price: 0,
		manufacturer: "",
		supplier: "",
		manufactureDate: "",
		expiryDate: "",
		location: "central-warehouse",
		minThreshold: 50,
		maxThreshold: 1000,
		storageCondition: "room-temperature",
		description: "",
	});

	const handleChange = (e) => {
		const { name, value, type } = e.target;
		setFormData({
			...formData,
			[name]: type === "number" ? Number.parseFloat(value) || 0 : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			!formData.name ||
			!formData.batchNo ||
			!formData.manufacturer ||
			!formData.supplier
		) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (!formData.manufactureDate || !formData.expiryDate) {
			toast.error("Please provide manufacture and expiry dates");
			return;
		}

		setLoading(true);
		try {
			await drugAPI.create(formData);
			toast.success("Drug added successfully");
			navigate("/inventory");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to add drug");
		} finally {
			setLoading(false);
		}
	};

	const FormSection = ({ icon: Icon, title, children }) => (
		<div className="space-y-4">
			<div className="flex items-center gap-3 pb-3 border-b border-slate-200">
				<div className="p-2 bg-primary-100 rounded-lg">
					<Icon className="w-4 h-4 text-primary-600" />
				</div>
				<h3 className="font-semibold text-slate-900">{title}</h3>
			</div>
			{children}
		</div>
	);

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<button
					onClick={() => navigate("/inventory")}
					className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Add New Drug</h1>
					<p className="text-slate-500">Add a new drug to the inventory</p>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="card">
					<FormSection icon={Package} title="Basic Information">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div>
								<label className="label">Drug Name *</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									className="input"
									placeholder="Enter drug name"
								/>
							</div>

							<div>
								<label className="label">Generic Name</label>
								<input
									type="text"
									name="genericName"
									value={formData.genericName}
									onChange={handleChange}
									className="input"
									placeholder="Enter generic name"
								/>
							</div>

							<div>
								<label className="label">Batch Number *</label>
								<input
									type="text"
									name="batchNo"
									value={formData.batchNo}
									onChange={handleChange}
									className="input"
									placeholder="Enter batch number"
								/>
							</div>

							<div>
								<label className="label">Category</label>
								<select
									name="category"
									value={formData.category}
									onChange={handleChange}
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
								<label className="label">Manufacturer *</label>
								<input
									type="text"
									name="manufacturer"
									value={formData.manufacturer}
									onChange={handleChange}
									className="input"
									placeholder="Enter manufacturer"
								/>
							</div>

							<div>
								<label className="label">Supplier *</label>
								<input
									type="text"
									name="supplier"
									value={formData.supplier}
									onChange={handleChange}
									className="input"
									placeholder="Enter supplier"
								/>
							</div>
						</div>
					</FormSection>
				</div>

				<div className="card">
					<FormSection icon={DollarSign} title="Stock Information">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div>
								<label className="label">Quantity</label>
								<input
									type="number"
									name="quantity"
									value={formData.quantity}
									onChange={handleChange}
									className="input"
									min="0"
								/>
							</div>

							<div>
								<label className="label">Unit</label>
								<select
									name="unit"
									value={formData.unit}
									onChange={handleChange}
									className="input"
								>
									<option value="tablets">Tablets</option>
									<option value="capsules">Capsules</option>
									<option value="vials">Vials</option>
									<option value="bottles">Bottles</option>
									<option value="boxes">Boxes</option>
									<option value="strips">Strips</option>
								</select>
							</div>

							<div>
								<label className="label">Price per Unit ($)</label>
								<input
									type="number"
									name="price"
									value={formData.price}
									onChange={handleChange}
									className="input"
									min="0"
									step="0.01"
								/>
							</div>

							<div>
								<label className="label">Min Threshold</label>
								<input
									type="number"
									name="minThreshold"
									value={formData.minThreshold}
									onChange={handleChange}
									className="input"
									min="0"
								/>
							</div>

							<div>
								<label className="label">Max Threshold</label>
								<input
									type="number"
									name="maxThreshold"
									value={formData.maxThreshold}
									onChange={handleChange}
									className="input"
									min="0"
								/>
							</div>

							<div>
								<label className="label">Location</label>
								<select
									name="location"
									value={formData.location}
									onChange={handleChange}
									className="input"
								>
									<option value="central-warehouse">Central Warehouse</option>
									<option value="city-hospital">City Hospital</option>
									<option value="district-pharmacy">District Pharmacy</option>
									<option value="mobile-unit">Mobile Unit</option>
								</select>
							</div>
						</div>
					</FormSection>
				</div>

				<div className="card">
					<FormSection icon={Calendar} title="Dates & Storage">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="label">Manufacture Date *</label>
								<input
									type="date"
									name="manufactureDate"
									value={formData.manufactureDate}
									onChange={handleChange}
									className="input"
								/>
							</div>

							<div>
								<label className="label">Expiry Date *</label>
								<input
									type="date"
									name="expiryDate"
									value={formData.expiryDate}
									onChange={handleChange}
									className="input"
								/>
							</div>

							<div>
								<label className="label">Storage Condition</label>
								<select
									name="storageCondition"
									value={formData.storageCondition}
									onChange={handleChange}
									className="input"
								>
									<option value="room-temperature">Room Temperature</option>
									<option value="refrigerated">Refrigerated</option>
									<option value="frozen">Frozen</option>
									<option value="controlled">Controlled</option>
								</select>
							</div>
						</div>
					</FormSection>
				</div>

				<div className="card">
					<FormSection icon={FileText} title="Additional Information">
						<div>
							<label className="label">Description</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleChange}
								className="input min-h-[120px]"
								rows={4}
								placeholder="Enter drug description and additional notes..."
							/>
						</div>
					</FormSection>
				</div>

				<div className="flex items-center justify-end gap-3 pt-4">
					<button
						type="button"
						onClick={() => navigate("/inventory")}
						className="btn btn-secondary"
					>
						Cancel
					</button>
					<button type="submit" disabled={loading} className="btn btn-primary">
						{loading ? (
							<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
						) : (
							<>
								<Save className="w-4 h-4" />
								Add Drug
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
}

// import { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { drugAPI } from "../services/api"
// import { ArrowLeft, Save } from "lucide-react"
// import toast from "react-hot-toast"

// export default function AddDrug() {
//   const navigate = useNavigate()
//   const [loading, setLoading] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     genericName: "",
//     category: "other",
//     batchNo: "",
//     quantity: 0,
//     unit: "tablets",
//     price: 0,
//     manufacturer: "",
//     supplier: "",
//     manufactureDate: "",
//     expiryDate: "",
//     location: "central-warehouse",
//     minThreshold: 50,
//     maxThreshold: 1000,
//     storageCondition: "room-temperature",
//     description: "",
//   })

//   const handleChange = (e) => {
//     const { name, value, type } = e.target
//     setFormData({
//       ...formData,
//       [name]: type === "number" ? Number.parseFloat(value) || 0 : value,
//     })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!formData.name || !formData.batchNo || !formData.manufacturer || !formData.supplier) {
//       toast.error("Please fill in all required fields")
//       return
//     }

//     if (!formData.manufactureDate || !formData.expiryDate) {
//       toast.error("Please provide manufacture and expiry dates")
//       return
//     }

//     setLoading(true)
//     try {
//       await drugAPI.create(formData)
//       toast.success("Drug added successfully")
//       navigate("/inventory")
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to add drug")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <button onClick={() => navigate("/inventory")} className="p-2 hover:bg-slate-100 rounded-lg">
//           <ArrowLeft className="w-5 h-5" />
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Add New Drug</h1>
//           <p className="text-slate-500">Add a new drug to the inventory</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="card">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Basic Info */}
//           <div className="lg:col-span-3">
//             <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
//           </div>

//           <div>
//             <label className="label">Drug Name *</label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="input"
//               placeholder="Enter drug name"
//             />
//           </div>

//           <div>
//             <label className="label">Generic Name</label>
//             <input
//               type="text"
//               name="genericName"
//               value={formData.genericName}
//               onChange={handleChange}
//               className="input"
//               placeholder="Enter generic name"
//             />
//           </div>

//           <div>
//             <label className="label">Batch Number *</label>
//             <input
//               type="text"
//               name="batchNo"
//               value={formData.batchNo}
//               onChange={handleChange}
//               className="input"
//               placeholder="Enter batch number"
//             />
//           </div>

//           <div>
//             <label className="label">Category</label>
//             <select name="category" value={formData.category} onChange={handleChange} className="input">
//               <option value="antibiotics">Antibiotics</option>
//               <option value="painkillers">Painkillers</option>
//               <option value="cardiovascular">Cardiovascular</option>
//               <option value="respiratory">Respiratory</option>
//               <option value="diabetes">Diabetes</option>
//               <option value="vitamins">Vitamins</option>
//               <option value="vaccines">Vaccines</option>
//               <option value="emergency">Emergency</option>
//               <option value="other">Other</option>
//             </select>
//           </div>

//           <div>
//             <label className="label">Manufacturer *</label>
//             <input
//               type="text"
//               name="manufacturer"
//               value={formData.manufacturer}
//               onChange={handleChange}
//               className="input"
//               placeholder="Enter manufacturer"
//             />
//           </div>

//           <div>
//             <label className="label">Supplier *</label>
//             <input
//               type="text"
//               name="supplier"
//               value={formData.supplier}
//               onChange={handleChange}
//               className="input"
//               placeholder="Enter supplier"
//             />
//           </div>

//           {/* Stock Info */}
//           <div className="lg:col-span-3 pt-4 border-t border-slate-200">
//             <h3 className="text-lg font-semibold text-slate-900 mb-4">Stock Information</h3>
//           </div>

//           <div>
//             <label className="label">Quantity</label>
//             <input
//               type="number"
//               name="quantity"
//               value={formData.quantity}
//               onChange={handleChange}
//               className="input"
//               min="0"
//             />
//           </div>

//           <div>
//             <label className="label">Unit</label>
//             <select name="unit" value={formData.unit} onChange={handleChange} className="input">
//               <option value="tablets">Tablets</option>
//               <option value="capsules">Capsules</option>
//               <option value="vials">Vials</option>
//               <option value="bottles">Bottles</option>
//               <option value="boxes">Boxes</option>
//               <option value="strips">Strips</option>
//             </select>
//           </div>

//           <div>
//             <label className="label">Price per Unit ($)</label>
//             <input
//               type="number"
//               name="price"
//               value={formData.price}
//               onChange={handleChange}
//               className="input"
//               min="0"
//               step="0.01"
//             />
//           </div>

//           <div>
//             <label className="label">Min Threshold</label>
//             <input
//               type="number"
//               name="minThreshold"
//               value={formData.minThreshold}
//               onChange={handleChange}
//               className="input"
//               min="0"
//             />
//           </div>

//           <div>
//             <label className="label">Max Threshold</label>
//             <input
//               type="number"
//               name="maxThreshold"
//               value={formData.maxThreshold}
//               onChange={handleChange}
//               className="input"
//               min="0"
//             />
//           </div>

//           <div>
//             <label className="label">Location</label>
//             <select name="location" value={formData.location} onChange={handleChange} className="input">
//               <option value="central-warehouse">Central Warehouse</option>
//               <option value="city-hospital">City Hospital</option>
//               <option value="district-pharmacy">District Pharmacy</option>
//               <option value="mobile-unit">Mobile Unit</option>
//             </select>
//           </div>

//           {/* Dates & Storage */}
//           <div className="lg:col-span-3 pt-4 border-t border-slate-200">
//             <h3 className="text-lg font-semibold text-slate-900 mb-4">Dates & Storage</h3>
//           </div>

//           <div>
//             <label className="label">Manufacture Date *</label>
//             <input
//               type="date"
//               name="manufactureDate"
//               value={formData.manufactureDate}
//               onChange={handleChange}
//               className="input"
//             />
//           </div>

//           <div>
//             <label className="label">Expiry Date *</label>
//             <input
//               type="date"
//               name="expiryDate"
//               value={formData.expiryDate}
//               onChange={handleChange}
//               className="input"
//             />
//           </div>

//           <div>
//             <label className="label">Storage Condition</label>
//             <select name="storageCondition" value={formData.storageCondition} onChange={handleChange} className="input">
//               <option value="room-temperature">Room Temperature</option>
//               <option value="refrigerated">Refrigerated</option>
//               <option value="frozen">Frozen</option>
//               <option value="controlled">Controlled</option>
//             </select>
//           </div>

//           <div className="lg:col-span-3">
//             <label className="label">Description</label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               className="input"
//               rows={3}
//               placeholder="Enter drug description"
//             />
//           </div>

//           <div className="lg:col-span-3 flex gap-3 pt-4">
//             <button type="submit" disabled={loading} className="btn btn-primary">
//               <Save className="w-4 h-4" />
//               {loading ? "Adding..." : "Add Drug"}
//             </button>
//             <button type="button" onClick={() => navigate("/inventory")} className="btn btn-secondary">
//               Cancel
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   )
// }
