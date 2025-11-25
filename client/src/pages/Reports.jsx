import { useState } from "react";
import { reportAPI } from "../services/api";
import {
	FileText,
	Download,
	Package,
	Truck,
	Clock,
	TrendingUp,
	Calendar,
	Filter,
	BarChart3,
	ArrowRight,
	CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const reportTypes = [
	{
		id: "inventory",
		label: "Inventory Report",
		icon: Package,
		description: "Current stock levels and values",
		color: "from-teal-500 to-cyan-500",
	},
	{
		id: "movement",
		label: "Movement Report",
		icon: Truck,
		description: "Supply chain movements and status",
		color: "from-blue-500 to-indigo-500",
	},
	{
		id: "expiry",
		label: "Expiry Report",
		icon: Clock,
		description: "Drugs expiring soon",
		color: "from-amber-500 to-orange-500",
	},
	{
		id: "consumption",
		label: "Consumption Report",
		icon: TrendingUp,
		description: "Drug usage and trends",
		color: "from-emerald-500 to-teal-500",
	},
];

export default function Reports() {
	const [selectedReport, setSelectedReport] = useState("inventory");
	const [loading, setLoading] = useState(false);
	const [report, setReport] = useState(null);
	const [filters, setFilters] = useState({
		startDate: "",
		endDate: "",
		location: "",
		category: "",
		status: "",
		days: 90,
	});

	const generateReport = async () => {
		setLoading(true);
		try {
			let response;
			const params = { ...filters };

			switch (selectedReport) {
				case "inventory":
					response = await reportAPI.getInventory(params);
					break;
				case "movement":
					response = await reportAPI.getMovement(params);
					break;
				case "expiry":
					response = await reportAPI.getExpiry(params);
					break;
				case "consumption":
					response = await reportAPI.getConsumption(params);
					break;
				default:
					throw new Error("Invalid report type");
			}

			setReport(response.data.report);
			toast.success("Report generated successfully");
		} catch (error) {
			toast.error("Failed to generate report");
		} finally {
			setLoading(false);
		}
	};

	const downloadReport = () => {
		if (!report) return;

		const jsonString = JSON.stringify(report, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${selectedReport}-report-${format(
			new Date(),
			"yyyy-MM-dd"
		)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const selectedReportData = reportTypes.find((r) => r.id === selectedReport);

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Reports</h1>
					<p className="text-slate-500">
						Generate and analyze inventory reports
					</p>
				</div>
				{report && (
					<button onClick={downloadReport} className="btn-primary">
						<Download className="w-4 h-4" />
						Download Report
					</button>
				)}
			</div>

			{/* Report Type Selection */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{reportTypes.map((type, index) => (
					<button
						key={type.id}
						onClick={() => {
							setSelectedReport(type.id);
							setReport(null);
						}}
						className={`relative p-5 rounded-2xl text-left transition-all duration-300 animate-slide-in ${
							selectedReport === type.id
								? "bg-white shadow-lg ring-2 ring-teal-500"
								: "bg-white/60 hover:bg-white hover:shadow-md"
						}`}
						style={{ animationDelay: `${index * 0.1}s` }}
					>
						<div className={`icon-box bg-gradient-to-br ${type.color} mb-3`}>
							<type.icon className="w-5 h-5 text-white" />
						</div>
						<p className="font-semibold text-slate-900">{type.label}</p>
						<p className="text-sm text-slate-500 mt-1">{type.description}</p>
						{selectedReport === type.id && (
							<div className="absolute top-3 right-3">
								<CheckCircle className="w-5 h-5 text-teal-500" />
							</div>
						)}
					</button>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Filters Panel */}
				<div className="card-elevated">
					<div className="flex items-center gap-3 mb-6">
						<div className="icon-box bg-gradient-to-br from-slate-600 to-slate-800">
							<Filter className="w-5 h-5 text-white" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-slate-900">Filters</h2>
							<p className="text-sm text-slate-500">Customize your report</p>
						</div>
					</div>

					<div className="space-y-4">
						{selectedReport !== "expiry" && (
							<>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										<Calendar className="w-4 h-4 inline mr-1" />
										Start Date
									</label>
									<input
										type="date"
										value={filters.startDate}
										onChange={(e) =>
											setFilters({ ...filters, startDate: e.target.value })
										}
										className="input-glass"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										<Calendar className="w-4 h-4 inline mr-1" />
										End Date
									</label>
									<input
										type="date"
										value={filters.endDate}
										onChange={(e) =>
											setFilters({ ...filters, endDate: e.target.value })
										}
										className="input-glass"
									/>
								</div>
							</>
						)}

						{selectedReport === "expiry" && (
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Days Ahead
								</label>
								<input
									type="number"
									value={filters.days}
									onChange={(e) =>
										setFilters({
											...filters,
											days: Number.parseInt(e.target.value),
										})
									}
									className="input-glass"
									min="1"
									max="365"
								/>
								<p className="text-xs text-slate-500 mt-1">
									Show drugs expiring within this period
								</p>
							</div>
						)}

						{(selectedReport === "inventory" ||
							selectedReport === "consumption") && (
							<>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Location
									</label>
									<select
										value={filters.location}
										onChange={(e) =>
											setFilters({ ...filters, location: e.target.value })
										}
										className="input-glass"
									>
										<option value="">All Locations</option>
										<option value="central-warehouse">Central Warehouse</option>
										<option value="city-hospital">City Hospital</option>
										<option value="district-pharmacy">District Pharmacy</option>
										<option value="mobile-unit">Mobile Unit</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Category
									</label>
									<select
										value={filters.category}
										onChange={(e) =>
											setFilters({ ...filters, category: e.target.value })
										}
										className="input-glass"
									>
										<option value="">All Categories</option>
										<option value="antibiotics">Antibiotics</option>
										<option value="painkillers">Painkillers</option>
										<option value="cardiovascular">Cardiovascular</option>
										<option value="respiratory">Respiratory</option>
										<option value="diabetes">Diabetes</option>
										<option value="vitamins">Vitamins</option>
										<option value="vaccines">Vaccines</option>
										<option value="emergency">Emergency</option>
									</select>
								</div>
							</>
						)}

						{selectedReport === "movement" && (
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-2">
									Status
								</label>
								<select
									value={filters.status}
									onChange={(e) =>
										setFilters({ ...filters, status: e.target.value })
									}
									className="input-glass"
								>
									<option value="">All Status</option>
									<option value="pending">Pending</option>
									<option value="approved">Approved</option>
									<option value="in_transit">In Transit</option>
									<option value="delivered">Delivered</option>
									<option value="cancelled">Cancelled</option>
								</select>
							</div>
						)}

						<button
							onClick={generateReport}
							disabled={loading}
							className="btn-primary w-full mt-4"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
									Generating...
								</span>
							) : (
								<>
									<BarChart3 className="w-4 h-4" />
									Generate Report
								</>
							)}
						</button>
					</div>
				</div>

				{/* Report Preview */}
				<div className="lg:col-span-2 card-elevated">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center gap-3">
							<div
								className={`icon-box bg-gradient-to-br ${selectedReportData?.color}`}
							>
								{selectedReportData && (
									<selectedReportData.icon className="w-5 h-5 text-white" />
								)}
							</div>
							<div>
								<h2 className="text-lg font-semibold text-slate-900">
									{selectedReportData?.label}
								</h2>
								<p className="text-sm text-slate-500">
									Report summary and preview
								</p>
							</div>
						</div>
						{report && (
							<button onClick={downloadReport} className="btn-secondary btn-sm">
								<Download className="w-4 h-4" />
								Export
							</button>
						)}
					</div>

					{!report ? (
						<div className="text-center py-16">
							<div className="relative inline-block mb-6">
								<div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center">
									<FileText className="w-12 h-12 text-slate-300" />
								</div>
							</div>
							<h3 className="font-semibold text-slate-900 mb-2">
								No Report Generated
							</h3>
							<p className="text-slate-500 mb-6">
								Configure filters and generate a report to see the summary
							</p>
							<button
								onClick={generateReport}
								disabled={loading}
								className="btn-secondary"
							>
								Generate Report
								<ArrowRight className="w-4 h-4" />
							</button>
						</div>
					) : (
						<div className="space-y-6 animate-fade-in">
							{/* Report Meta */}
							<div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
										<CheckCircle className="w-5 h-5 text-emerald-600" />
									</div>
									<div>
										<p className="font-medium text-slate-900">
											Report Generated
										</p>
										<p className="text-sm text-slate-500">
											{format(
												new Date(report.generatedAt),
												"MMM d, yyyy h:mm a"
											)}
										</p>
									</div>
								</div>
							</div>

							{/* Summary Stats */}
							{report.summary && (
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									{Object.entries(report.summary).map(([key, value], index) => (
										<div
											key={key}
											className="p-4 bg-slate-50 rounded-xl animate-scale-in"
											style={{ animationDelay: `${index * 0.1}s` }}
										>
											<p className="text-sm text-slate-500 capitalize mb-1">
												{key.replace(/([A-Z])/g, " $1").trim()}
											</p>
											<p className="text-2xl font-bold text-slate-900">
												{typeof value === "number"
													? value.toLocaleString()
													: value}
											</p>
										</div>
									))}
								</div>
							)}

							{/* Items Count */}
							{report.items && (
								<div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Package className="w-5 h-5 text-teal-600" />
											<span className="font-medium text-teal-900">
												Total Items
											</span>
										</div>
										<span className="text-2xl font-bold text-teal-600">
											{report.items.length}
										</span>
									</div>
								</div>
							)}

							{/* Report Details Table Preview */}
							{report.items && report.items.length > 0 && (
								<div className="border border-slate-200 rounded-xl overflow-hidden">
									<div className="max-h-64 overflow-y-auto">
										<table className="w-full">
											<thead className="bg-slate-50 sticky top-0">
												<tr>
													<th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
														Item
													</th>
													<th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
														Details
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
												{report.items.slice(0, 5).map((item, index) => (
													<tr
														key={index}
														className="hover:bg-slate-50 transition-colors"
													>
														<td className="px-4 py-3">
															<p className="font-medium text-slate-900">
																{item.name ||
																	item.drugName ||
																	`Item ${index + 1}`}
															</p>
														</td>
														<td className="px-4 py-3 text-sm text-slate-500">
															{item.quantity && `Qty: ${item.quantity}`}
															{item.status && ` | ${item.status}`}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
									{report.items.length > 5 && (
										<div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-center">
											<p className="text-sm text-slate-500">
												And {report.items.length - 5} more items... Download to
												see all.
											</p>
										</div>
									)}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// above correct

// "use client"

// import { useState } from "react"
// import { reportAPI } from "../services/api"
// import { FileText, Download, Package, Truck, Clock, TrendingUp } from "lucide-react"
// import { format } from "date-fns"
// import toast from "react-hot-toast"

// const reportTypes = [
//   { id: "inventory", label: "Inventory Report", icon: Package, description: "Current stock levels and values" },
//   { id: "movement", label: "Movement Report", icon: Truck, description: "Supply chain movements and status" },
//   { id: "expiry", label: "Expiry Report", icon: Clock, description: "Drugs expiring soon" },
//   { id: "consumption", label: "Consumption Report", icon: TrendingUp, description: "Drug usage and trends" },
// ]

// export default function Reports() {
//   const [selectedReport, setSelectedReport] = useState("inventory")
//   const [loading, setLoading] = useState(false)
//   const [report, setReport] = useState(null)
//   const [filters, setFilters] = useState({
//     startDate: "",
//     endDate: "",
//     location: "",
//     category: "",
//     status: "",
//     days: 90,
//   })

//   const generateReport = async () => {
//     setLoading(true)
//     try {
//       let response
//       const params = { ...filters }

//       switch (selectedReport) {
//         case "inventory":
//           response = await reportAPI.getInventory(params)
//           break
//         case "movement":
//           response = await reportAPI.getMovement(params)
//           break
//         case "expiry":
//           response = await reportAPI.getExpiry(params)
//           break
//         case "consumption":
//           response = await reportAPI.getConsumption(params)
//           break
//         default:
//           throw new Error("Invalid report type")
//       }

//       setReport(response.data.report)
//       toast.success("Report generated successfully")
//     } catch (error) {
//       toast.error("Failed to generate report")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const downloadReport = () => {
//     if (!report) return

//     const jsonString = JSON.stringify(report, null, 2)
//     const blob = new Blob([jsonString], { type: "application/json" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `${selectedReport}-report-${format(new Date(), "yyyy-MM-dd")}.json`
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
//         <p className="text-slate-500">Generate and download inventory reports</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Report Selection */}
//         <div className="card">
//           <h2 className="text-lg font-semibold text-slate-900 mb-4">Report Type</h2>
//           <div className="space-y-2">
//             {reportTypes.map((type) => (
//               <button
//                 key={type.id}
//                 onClick={() => {
//                   setSelectedReport(type.id)
//                   setReport(null)
//                 }}
//                 className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
//                   selectedReport === type.id
//                     ? "border-primary-500 bg-primary-50"
//                     : "border-slate-200 hover:border-slate-300"
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <type.icon
//                     className={`w-5 h-5 ${selectedReport === type.id ? "text-primary-600" : "text-slate-400"}`}
//                   />
//                   <div>
//                     <p className="font-medium text-slate-900">{type.label}</p>
//                     <p className="text-sm text-slate-500">{type.description}</p>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="card">
//           <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>
//           <div className="space-y-4">
//             {selectedReport !== "expiry" && (
//               <>
//                 <div>
//                   <label className="label">Start Date</label>
//                   <input
//                     type="date"
//                     value={filters.startDate}
//                     onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
//                     className="input"
//                   />
//                 </div>
//                 <div>
//                   <label className="label">End Date</label>
//                   <input
//                     type="date"
//                     value={filters.endDate}
//                     onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
//                     className="input"
//                   />
//                 </div>
//               </>
//             )}

//             {selectedReport === "expiry" && (
//               <div>
//                 <label className="label">Days Ahead</label>
//                 <input
//                   type="number"
//                   value={filters.days}
//                   onChange={(e) => setFilters({ ...filters, days: Number.parseInt(e.target.value) })}
//                   className="input"
//                   min="1"
//                   max="365"
//                 />
//               </div>
//             )}

//             {(selectedReport === "inventory" || selectedReport === "consumption") && (
//               <>
//                 <div>
//                   <label className="label">Location</label>
//                   <select
//                     value={filters.location}
//                     onChange={(e) => setFilters({ ...filters, location: e.target.value })}
//                     className="input"
//                   >
//                     <option value="">All Locations</option>
//                     <option value="central-warehouse">Central Warehouse</option>
//                     <option value="city-hospital">City Hospital</option>
//                     <option value="district-pharmacy">District Pharmacy</option>
//                     <option value="mobile-unit">Mobile Unit</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="label">Category</label>
//                   <select
//                     value={filters.category}
//                     onChange={(e) => setFilters({ ...filters, category: e.target.value })}
//                     className="input"
//                   >
//                     <option value="">All Categories</option>
//                     <option value="antibiotics">Antibiotics</option>
//                     <option value="painkillers">Painkillers</option>
//                     <option value="cardiovascular">Cardiovascular</option>
//                     <option value="respiratory">Respiratory</option>
//                     <option value="diabetes">Diabetes</option>
//                     <option value="vitamins">Vitamins</option>
//                     <option value="vaccines">Vaccines</option>
//                     <option value="emergency">Emergency</option>
//                   </select>
//                 </div>
//               </>
//             )}

//             {selectedReport === "movement" && (
//               <div>
//                 <label className="label">Status</label>
//                 <select
//                   value={filters.status}
//                   onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                   className="input"
//                 >
//                   <option value="">All Status</option>
//                   <option value="pending">Pending</option>
//                   <option value="approved">Approved</option>
//                   <option value="in_transit">In Transit</option>
//                   <option value="delivered">Delivered</option>
//                   <option value="cancelled">Cancelled</option>
//                 </select>
//               </div>
//             )}

//             <button onClick={generateReport} disabled={loading} className="btn btn-primary w-full">
//               <FileText className="w-4 h-4" />
//               {loading ? "Generating..." : "Generate Report"}
//             </button>
//           </div>
//         </div>

//         {/* Report Preview */}
//         <div className="card">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-slate-900">Report Summary</h2>
//             {report && (
//               <button onClick={downloadReport} className="btn btn-secondary btn-sm">
//                 <Download className="w-4 h-4" />
//                 Download
//               </button>
//             )}
//           </div>

//           {!report ? (
//             <div className="text-center py-8">
//               <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
//               <p className="text-slate-500">Generate a report to see summary</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <p className="text-sm text-slate-500">
//                 Generated: {format(new Date(report.generatedAt), "MMM d, yyyy h:mm a")}
//               </p>

//               {report.summary && (
//                 <div className="space-y-2">
//                   {Object.entries(report.summary).map(([key, value]) => (
//                     <div key={key} className="flex justify-between py-2 border-b border-slate-100">
//                       <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
//                       <span className="font-semibold text-slate-900">
//                         {typeof value === "number" ? value.toLocaleString() : value}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {report.items && <p className="text-sm text-slate-500">Total items: {report.items.length}</p>}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
