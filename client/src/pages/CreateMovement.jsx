import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { movementAPI, drugAPI, authAPI } from "../services/api";
import {
	ArrowLeft,
	Save,
	Package,
	Truck,
	FileText,
	AlertCircle,
	ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function CreateMovement() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [drugs, setDrugs] = useState([]);
	const [drivers, setDrivers] = useState([]);
	const [selectedDrug, setSelectedDrug] = useState(null);
	const [formData, setFormData] = useState({
		drugId: "",
		quantity: 1,
		from: "central-warehouse",
		to: "city-hospital",
		priority: "normal",
		expectedDelivery: "",
		driver: "",
		notes: "",
	});

	useEffect(() => {
		fetchDrugs();
		fetchDrivers();
	}, []);

	const fetchDrugs = async () => {
		try {
			const { data } = await drugAPI.getAll({ limit: 100 });
			setDrugs(data.drugs.filter((d) => d.quantity > 0));
		} catch (error) {
			toast.error("Failed to fetch drugs");
		}
	};

	const fetchDrivers = async () => {
		try {
			const { data } = await authAPI.getUsers();
			setDrivers(data.users.filter((u) => u.role === "driver"));
		} catch (error) {
			console.error("Failed to fetch drivers");
		}
	};

	const handleDrugSelect = (drugId) => {
		const drug = drugs.find((d) => d._id === drugId);
		setSelectedDrug(drug);
		setFormData({
			...formData,
			drugId,
			from: drug?.location || "central-warehouse",
		});
	};

	const handleChange = (e) => {
		const { name, value, type } = e.target;
		setFormData({
			...formData,
			[name]: type === "number" ? Number.parseInt(value) || 0 : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.drugId) {
			toast.error("Please select a drug");
			return;
		}

		if (formData.quantity <= 0) {
			toast.error("Quantity must be greater than 0");
			return;
		}

		if (selectedDrug && formData.quantity > selectedDrug.quantity) {
			toast.error(`Insufficient stock. Available: ${selectedDrug.quantity}`);
			return;
		}

		if (formData.from === formData.to) {
			toast.error("Source and destination cannot be the same");
			return;
		}

		setLoading(true);
		try {
			await movementAPI.create(formData);
			toast.success("Movement created successfully");
			navigate("/movements");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create movement");
		} finally {
			setLoading(false);
		}
	};

	const priorityConfig = {
		low: {
			bg: "bg-slate-100",
			text: "text-slate-600",
			border: "border-slate-200",
		},
		normal: {
			bg: "bg-blue-100",
			text: "text-blue-600",
			border: "border-blue-200",
		},
		high: {
			bg: "bg-amber-100",
			text: "text-amber-600",
			border: "border-amber-200",
		},
		urgent: {
			bg: "bg-red-100",
			text: "text-red-600",
			border: "border-red-200",
		},
	};

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<button
					onClick={() => navigate("/movements")}
					className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Create Movement</h1>
					<p className="text-slate-500">Create a new drug movement request</p>
				</div>
			</div>

			<form
				onSubmit={handleSubmit}
				className="grid grid-cols-1 lg:grid-cols-3 gap-6"
			>
				<div className="lg:col-span-2 space-y-6">
					<div className="card">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 bg-primary-100 rounded-lg">
								<Package className="w-5 h-5 text-primary-600" />
							</div>
							<h2 className="font-semibold text-slate-900">Select Drug</h2>
						</div>
						<select
							name="drugId"
							value={formData.drugId}
							onChange={(e) => handleDrugSelect(e.target.value)}
							className="input"
						>
							<option value="">Choose a drug to transfer</option>
							{drugs.map((drug) => (
								<option key={drug._id} value={drug._id}>
									{drug.name} - {drug.drugId} (Available: {drug.quantity})
								</option>
							))}
						</select>

						{selectedDrug && (
							<div className="mt-4 p-4 bg-slate-50 rounded-xl animate-fade-in">
								<div className="flex items-center gap-3 mb-3">
									<div className="p-2 bg-white rounded-lg shadow-sm">
										<Package className="w-5 h-5 text-primary-600" />
									</div>
									<div>
										<p className="font-semibold text-slate-900">
											{selectedDrug.name}
										</p>
										<p className="text-sm text-slate-500">
											{selectedDrug.drugId}
										</p>
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4 text-sm">
									<div>
										<p className="text-slate-500">Available</p>
										<p className="font-semibold text-slate-900">
											{selectedDrug.quantity} {selectedDrug.unit}
										</p>
									</div>
									<div>
										<p className="text-slate-500">Batch</p>
										<p className="font-semibold text-slate-900">
											{selectedDrug.batchNo}
										</p>
									</div>
									<div>
										<p className="text-slate-500">Category</p>
										<p className="font-semibold text-slate-900 capitalize">
											{selectedDrug.category}
										</p>
									</div>
								</div>
							</div>
						)}
					</div>

					<div className="card">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 bg-primary-100 rounded-lg">
								<Truck className="w-5 h-5 text-primary-600" />
							</div>
							<h2 className="font-semibold text-slate-900">Route Details</h2>
						</div>

						<div className="flex items-center gap-4 mb-6">
							<div className="flex-1">
								<label className="label">From Location *</label>
								<select
									name="from"
									value={formData.from}
									onChange={handleChange}
									className="input"
								>
									<option value="central-warehouse">Central Warehouse</option>
									<option value="city-hospital">City Hospital</option>
									<option value="district-pharmacy">District Pharmacy</option>
									<option value="mobile-unit">Mobile Unit</option>
								</select>
							</div>
							<div className="pt-6">
								<div className="p-2 bg-slate-100 rounded-lg">
									<ArrowRight className="w-5 h-5 text-slate-400" />
								</div>
							</div>
							<div className="flex-1">
								<label className="label">To Location *</label>
								<select
									name="to"
									value={formData.to}
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

						{formData.from === formData.to && (
							<div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-xl text-sm">
								<AlertCircle className="w-4 h-4" />
								<span>Source and destination cannot be the same</span>
							</div>
						)}
					</div>

					<div className="card">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 bg-primary-100 rounded-lg">
								<FileText className="w-5 h-5 text-primary-600" />
							</div>
							<h2 className="font-semibold text-slate-900">Movement Details</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="label">Quantity *</label>
								<input
									type="number"
									name="quantity"
									value={formData.quantity}
									onChange={handleChange}
									className="input"
									min="1"
									max={selectedDrug?.quantity || 9999}
								/>
								{selectedDrug && formData.quantity > selectedDrug.quantity && (
									<p className="text-sm text-red-500 mt-1">
										Exceeds available stock ({selectedDrug.quantity})
									</p>
								)}
							</div>

							<div>
								<label className="label">Priority</label>
								<div className="grid grid-cols-4 gap-2">
									{["low", "normal", "high", "urgent"].map((p) => {
										const config = priorityConfig[p];
										return (
											<button
												key={p}
												type="button"
												onClick={() =>
													setFormData({ ...formData, priority: p })
												}
												className={clsx(
													"py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all border",
													formData.priority === p
														? `${config.bg} ${config.text} ${config.border}`
														: "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
												)}
											>
												{p}
											</button>
										);
									})}
								</div>
							</div>

							<div>
								<label className="label">Expected Delivery</label>
								<input
									type="date"
									name="expectedDelivery"
									value={formData.expectedDelivery}
									onChange={handleChange}
									className="input"
								/>
							</div>

							<div>
								<label className="label">Assign Driver</label>
								<select
									name="driver"
									value={formData.driver}
									onChange={handleChange}
									className="input"
								>
									<option value="">Select later</option>
									{drivers.map((driver) => (
										<option key={driver._id} value={driver._id}>
											{driver.name}
										</option>
									))}
								</select>
							</div>

							<div className="md:col-span-2">
								<label className="label">Notes</label>
								<textarea
									name="notes"
									value={formData.notes}
									onChange={handleChange}
									className="input min-h-[100px]"
									rows={3}
									placeholder="Add any additional notes..."
								/>
							</div>
						</div>
					</div>

					<div className="flex items-center justify-end gap-3">
						<button
							type="button"
							onClick={() => navigate("/movements")}
							className="btn btn-secondary"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading || formData.from === formData.to}
							className="btn btn-primary"
						>
							{loading ? (
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<>
									<Save className="w-4 h-4" />
									Create Movement
								</>
							)}
						</button>
					</div>
				</div>

				<div className="space-y-6">
					{selectedDrug && (
						<div className="card sticky top-24 animate-fade-in">
							<h3 className="font-semibold text-slate-900 mb-4">
								Movement Summary
							</h3>

							<div className="space-y-4">
								<div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
									<div className="p-2 bg-white rounded-lg shadow-sm">
										<Package className="w-5 h-5 text-primary-600" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-slate-900 truncate">
											{selectedDrug.name}
										</p>
										<p className="text-sm text-slate-500">
											{selectedDrug.drugId}
										</p>
									</div>
								</div>

								<div className="space-y-3 text-sm">
									<div className="flex justify-between py-2 border-b border-slate-100">
										<span className="text-slate-500">Quantity</span>
										<span className="font-semibold text-slate-900">
											{formData.quantity} {selectedDrug.unit}
										</span>
									</div>
									<div className="flex justify-between py-2 border-b border-slate-100">
										<span className="text-slate-500">From</span>
										<span className="font-medium text-slate-900 capitalize">
											{formData.from.replace("-", " ")}
										</span>
									</div>
									<div className="flex justify-between py-2 border-b border-slate-100">
										<span className="text-slate-500">To</span>
										<span className="font-medium text-slate-900 capitalize">
											{formData.to.replace("-", " ")}
										</span>
									</div>
									<div className="flex justify-between py-2 border-b border-slate-100">
										<span className="text-slate-500">Priority</span>
										<span
											className={clsx(
												"badge",
												priorityConfig[formData.priority].bg,
												priorityConfig[formData.priority].text
											)}
										>
											{formData.priority}
										</span>
									</div>
									{formData.expectedDelivery && (
										<div className="flex justify-between py-2">
											<span className="text-slate-500">Expected</span>
											<span className="font-medium text-slate-900">
												{new Date(
													formData.expectedDelivery
												).toLocaleDateString()}
											</span>
										</div>
									)}
								</div>

								<div className="pt-4 border-t border-slate-200">
									<div className="flex items-center gap-2 text-sm text-slate-500">
										<AlertCircle className="w-4 h-4" />
										<span>Stock will be deducted upon approval</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</form>
		</div>
	);
}

// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { movementAPI, drugAPI, authAPI } from "../services/api"
// import { ArrowLeft, Save, Package } from "lucide-react"
// import toast from "react-hot-toast"

// export default function CreateMovement() {
//   const navigate = useNavigate()
//   const [loading, setLoading] = useState(false)
//   const [drugs, setDrugs] = useState([])
//   const [drivers, setDrivers] = useState([])
//   const [selectedDrug, setSelectedDrug] = useState(null)
//   const [formData, setFormData] = useState({
//     drugId: "",
//     quantity: 1,
//     from: "central-warehouse",
//     to: "city-hospital",
//     priority: "normal",
//     expectedDelivery: "",
//     driver: "",
//     notes: "",
//   })

//   useEffect(() => {
//     fetchDrugs()
//     fetchDrivers()
//   }, [])

//   const fetchDrugs = async () => {
//     try {
//       const { data } = await drugAPI.getAll({ limit: 100 })
//       setDrugs(data.drugs.filter((d) => d.quantity > 0))
//     } catch (error) {
//       toast.error("Failed to fetch drugs")
//     }
//   }

//   const fetchDrivers = async () => {
//     try {
//       const { data } = await authAPI.getUsers()
//       setDrivers(data.users.filter((u) => u.role === "driver"))
//     } catch (error) {
//       console.error("Failed to fetch drivers")
//     }
//   }

//   const handleDrugSelect = (drugId) => {
//     const drug = drugs.find((d) => d._id === drugId)
//     setSelectedDrug(drug)
//     setFormData({ ...formData, drugId, from: drug?.location || "central-warehouse" })
//   }

//   const handleChange = (e) => {
//     const { name, value, type } = e.target
//     setFormData({
//       ...formData,
//       [name]: type === "number" ? Number.parseInt(value) || 0 : value,
//     })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!formData.drugId) {
//       toast.error("Please select a drug")
//       return
//     }

//     if (formData.quantity <= 0) {
//       toast.error("Quantity must be greater than 0")
//       return
//     }

//     if (selectedDrug && formData.quantity > selectedDrug.quantity) {
//       toast.error(`Insufficient stock. Available: ${selectedDrug.quantity}`)
//       return
//     }

//     if (formData.from === formData.to) {
//       toast.error("Source and destination cannot be the same")
//       return
//     }

//     setLoading(true)
//     try {
//       await movementAPI.create(formData)
//       toast.success("Movement created successfully")
//       navigate("/movements")
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to create movement")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <button onClick={() => navigate("/movements")} className="p-2 hover:bg-slate-100 rounded-lg">
//           <ArrowLeft className="w-5 h-5" />
//         </button>
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Create Movement</h1>
//           <p className="text-slate-500">Create a new drug movement request</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 card">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Drug Selection */}
//             <div className="md:col-span-2">
//               <label className="label">Select Drug *</label>
//               <select
//                 name="drugId"
//                 value={formData.drugId}
//                 onChange={(e) => handleDrugSelect(e.target.value)}
//                 className="input"
//               >
//                 <option value="">Choose a drug</option>
//                 {drugs.map((drug) => (
//                   <option key={drug._id} value={drug._id}>
//                     {drug.name} - {drug.drugId} (Available: {drug.quantity})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="label">Quantity *</label>
//               <input
//                 type="number"
//                 name="quantity"
//                 value={formData.quantity}
//                 onChange={handleChange}
//                 className="input"
//                 min="1"
//                 max={selectedDrug?.quantity || 9999}
//               />
//               {selectedDrug && (
//                 <p className="text-sm text-slate-500 mt-1">
//                   Available: {selectedDrug.quantity} {selectedDrug.unit}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="label">Priority</label>
//               <select name="priority" value={formData.priority} onChange={handleChange} className="input">
//                 <option value="low">Low</option>
//                 <option value="normal">Normal</option>
//                 <option value="high">High</option>
//                 <option value="urgent">Urgent</option>
//               </select>
//             </div>

//             <div>
//               <label className="label">From Location *</label>
//               <select name="from" value={formData.from} onChange={handleChange} className="input">
//                 <option value="central-warehouse">Central Warehouse</option>
//                 <option value="city-hospital">City Hospital</option>
//                 <option value="district-pharmacy">District Pharmacy</option>
//                 <option value="mobile-unit">Mobile Unit</option>
//               </select>
//             </div>

//             <div>
//               <label className="label">To Location *</label>
//               <select name="to" value={formData.to} onChange={handleChange} className="input">
//                 <option value="central-warehouse">Central Warehouse</option>
//                 <option value="city-hospital">City Hospital</option>
//                 <option value="district-pharmacy">District Pharmacy</option>
//                 <option value="mobile-unit">Mobile Unit</option>
//               </select>
//             </div>

//             <div>
//               <label className="label">Expected Delivery</label>
//               <input
//                 type="date"
//                 name="expectedDelivery"
//                 value={formData.expectedDelivery}
//                 onChange={handleChange}
//                 className="input"
//               />
//             </div>

//             <div>
//               <label className="label">Assign Driver</label>
//               <select name="driver" value={formData.driver} onChange={handleChange} className="input">
//                 <option value="">Select later</option>
//                 {drivers.map((driver) => (
//                   <option key={driver._id} value={driver._id}>
//                     {driver.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="md:col-span-2">
//               <label className="label">Notes</label>
//               <textarea
//                 name="notes"
//                 value={formData.notes}
//                 onChange={handleChange}
//                 className="input"
//                 rows={3}
//                 placeholder="Add any additional notes..."
//               />
//             </div>

//             <div className="md:col-span-2 flex gap-3 pt-4">
//               <button type="submit" disabled={loading} className="btn btn-primary">
//                 <Save className="w-4 h-4" />
//                 {loading ? "Creating..." : "Create Movement"}
//               </button>
//               <button type="button" onClick={() => navigate("/movements")} className="btn btn-secondary">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Selected Drug Preview */}
//         {selectedDrug && (
//           <div className="card h-fit">
//             <h3 className="text-lg font-semibold text-slate-900 mb-4">Selected Drug</h3>
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-3 bg-primary-100 rounded-lg">
//                 <Package className="w-6 h-6 text-primary-600" />
//               </div>
//               <div>
//                 <p className="font-semibold text-slate-900">{selectedDrug.name}</p>
//                 <p className="text-sm text-slate-500">{selectedDrug.drugId}</p>
//               </div>
//             </div>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-slate-500">Batch</span>
//                 <span className="text-slate-900">{selectedDrug.batchNo}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-slate-500">Available</span>
//                 <span className="text-slate-900">
//                   {selectedDrug.quantity} {selectedDrug.unit}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-slate-500">Location</span>
//                 <span className="text-slate-900 capitalize">{selectedDrug.location.replace("-", " ")}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-slate-500">Category</span>
//                 <span className="text-slate-900 capitalize">{selectedDrug.category}</span>
//               </div>
//             </div>
//           </div>
//         )}
//       </form>
//     </div>
//   )
// }
