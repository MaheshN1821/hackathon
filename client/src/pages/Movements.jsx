import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { movementAPI } from "../services/api";
import { socketService } from "../services/socket";
import { useAuthStore } from "../store/authStore";
import {
	Plus,
	Truck,
	Clock,
	ArrowRight,
	Package,
	User,
	Calendar,
	ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";
import toast from "react-hot-toast";

const statusConfig = {
	pending: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
	approved: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
	in_transit: {
		bg: "bg-amber-100",
		text: "text-amber-700",
		dot: "bg-amber-500",
	},
	delivered: {
		bg: "bg-emerald-100",
		text: "text-emerald-700",
		dot: "bg-emerald-500",
	},
	cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const priorityConfig = {
	low: { bg: "bg-slate-100", text: "text-slate-600" },
	normal: { bg: "bg-blue-100", text: "text-blue-600" },
	high: { bg: "bg-amber-100", text: "text-amber-600" },
	urgent: { bg: "bg-red-100", text: "text-red-600" },
};

export default function Movements() {
	const [movements, setMovements] = useState([]);
	const [loading, setLoading] = useState(true);
	const [status, setStatus] = useState("");
	const [priority, setPriority] = useState("");
	const { user } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		fetchMovements();

		const unsubscribe = socketService.on("movementChanged", () => {
			fetchMovements();
		});

		return unsubscribe;
	}, [status, priority]);

	const fetchMovements = async () => {
		try {
			const params = {};
			if (status) params.status = status;
			if (priority) params.priority = priority;

			const { data } = await movementAPI.getAll(params);
			setMovements(data.movements);
		} catch (error) {
			toast.error("Failed to fetch movements");
		} finally {
			setLoading(false);
		}
	};

	// Group movements by status
	const groupedMovements = movements.reduce((acc, movement) => {
		const key = movement.status;
		if (!acc[key]) acc[key] = [];
		acc[key].push(movement);
		return acc;
	}, {});

	return (
		<div className="space-y-6">
			<div className="page-header">
				<div>
					<h1 className="page-title">Supply Chain</h1>
					<p className="page-subtitle">
						Track and manage drug movements ({movements.length} total)
					</p>
				</div>
				{["admin", "warehouse"].includes(user?.role) && (
					<button
						onClick={() => navigate("/movements/create")}
						className="btn btn-primary"
					>
						<Plus className="w-4 h-4" />
						Create Movement
					</button>
				)}
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
				{Object.entries(statusConfig).map(([key, config]) => {
					const count = groupedMovements[key]?.length || 0;
					return (
						<button
							key={key}
							onClick={() => setStatus(status === key ? "" : key)}
							className={clsx(
								"card card-hover text-left transition-all",
								status === key && "ring-2 ring-primary-500"
							)}
						>
							<div className="flex items-center gap-2 mb-2">
								<div className={clsx("w-2 h-2 rounded-full", config.dot)} />
								<span className="text-sm font-medium text-slate-500 capitalize">
									{key.replace("_", " ")}
								</span>
							</div>
							<p className="text-2xl font-bold text-slate-900">{count}</p>
						</button>
					);
				})}
			</div>

			<div className="card">
				<div className="flex flex-wrap gap-4">
					<div className="flex-1 min-w-[200px]">
						<label className="label">Status</label>
						<select
							value={status}
							onChange={(e) => setStatus(e.target.value)}
							className="input"
						>
							<option value="">All Status</option>
							<option value="pending">Pending</option>
							<option value="approved">Approved</option>
							<option value="in_transit">In Transit</option>
							<option value="delivered">Delivered</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>
					<div className="flex-1 min-w-[200px]">
						<label className="label">Priority</label>
						<select
							value={priority}
							onChange={(e) => setPriority(e.target.value)}
							className="input"
						>
							<option value="">All Priority</option>
							<option value="low">Low</option>
							<option value="normal">Normal</option>
							<option value="high">High</option>
							<option value="urgent">Urgent</option>
						</select>
					</div>
				</div>
			</div>

			{loading ? (
				<div className="space-y-4">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="h-36 skeleton rounded-2xl" />
					))}
				</div>
			) : movements.length === 0 ? (
				<div className="card empty-state">
					<div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
						<Truck className="w-10 h-10 text-slate-300" />
					</div>
					<h3 className="text-lg font-semibold text-slate-900">
						No movements found
					</h3>
					<p className="text-slate-500 mt-1">
						Create a new movement to get started
					</p>
					{["admin", "warehouse"].includes(user?.role) && (
						<button
							onClick={() => navigate("/movements/create")}
							className="btn btn-primary mt-4"
						>
							<Plus className="w-4 h-4" />
							Create Movement
						</button>
					)}
				</div>
			) : (
				<div className="space-y-4">
					{movements.map((movement, index) => {
						const statusStyles =
							statusConfig[movement.status] || statusConfig.pending;
						const priorityStyles =
							priorityConfig[movement.priority] || priorityConfig.normal;

						return (
							<div
								key={movement._id}
								className="card card-hover cursor-pointer group animate-fade-in"
								style={{ animationDelay: `${index * 50}ms` }}
								onClick={() => navigate(`/movements/${movement._id}`)}
							>
								<div className="flex flex-col lg:flex-row lg:items-center gap-6">
									{/* Movement Info */}
									<div className="flex-1">
										<div className="flex items-start gap-4">
											<div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl shrink-0">
												<Truck className="w-6 h-6 text-primary-600" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-3">
													<h3 className="font-bold text-slate-900 text-lg">
														{movement.movementId}
													</h3>
													<span
														className={clsx(
															"badge",
															statusStyles.bg,
															statusStyles.text
														)}
													>
														<span
															className={clsx(
																"w-1.5 h-1.5 rounded-full",
																statusStyles.dot
															)}
														/>
														{movement.status.replace("_", " ")}
													</span>
													<span
														className={clsx(
															"badge",
															priorityStyles.bg,
															priorityStyles.text
														)}
													>
														{movement.priority}
													</span>
												</div>
												<p className="text-sm text-slate-500 mt-1">
													<span className="inline-flex items-center gap-1">
														<Package className="w-4 h-4" />
														{movement.drug?.name}
													</span>
													<span className="mx-2">-</span>
													<span className="font-semibold">
														{movement.quantity} units
													</span>
												</p>

												<div className="flex items-center gap-3 mt-4 p-3 bg-slate-50 rounded-xl">
													<div className="flex items-center gap-2 flex-1">
														<div className="w-3 h-3 bg-primary-500 rounded-full" />
														<div>
															<p className="text-xs text-slate-400">From</p>
															<p className="font-medium text-slate-700 capitalize">
																{movement.from.replace("-", " ")}
															</p>
														</div>
													</div>
													<div className="flex-1 flex items-center justify-center">
														<div className="h-0.5 flex-1 bg-slate-200 rounded-full" />
														<ArrowRight className="w-5 h-5 text-slate-400 mx-2" />
														<div className="h-0.5 flex-1 bg-slate-200 rounded-full" />
													</div>
													<div className="flex items-center gap-2 flex-1 justify-end">
														<div>
															<p className="text-xs text-slate-400 text-right">
																To
															</p>
															<p className="font-medium text-slate-700 capitalize">
																{movement.to.replace("-", " ")}
															</p>
														</div>
														<div className="w-3 h-3 bg-emerald-500 rounded-full" />
													</div>
												</div>
											</div>
										</div>
									</div>

									{/* Meta info */}
									<div className="flex items-center gap-6 lg:gap-8">
										<div className="text-center">
											<div className="flex items-center gap-1 text-slate-500 text-sm">
												<Calendar className="w-4 h-4" />
												<span>
													{format(new Date(movement.createdAt), "MMM d")}
												</span>
											</div>
											{movement.driver && (
												<div className="flex items-center gap-1 text-slate-600 text-sm mt-1">
													<User className="w-4 h-4" />
													<span>{movement.driver.name}</span>
												</div>
											)}
										</div>
										<ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
									</div>
								</div>

								{/* Scan History Preview */}
								{movement.scanHistory?.length > 0 && (
									<div className="mt-4 pt-4 border-t border-slate-100">
										<div className="flex items-center gap-2 text-sm text-slate-500">
											<Clock className="w-4 h-4" />
											<span>
												Last scan:{" "}
												<span className="font-medium text-slate-700 capitalize">
													{movement.scanHistory[
														movement.scanHistory.length - 1
													].location.replace("-", " ")}
												</span>
												{" - "}
												{format(
													new Date(
														movement.scanHistory[
															movement.scanHistory.length - 1
														].scannedAt
													),
													"MMM d, h:mm a"
												)}
											</span>
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { movementAPI } from "../services/api"
// import { socketService } from "../services/socket"
// import { useAuthStore } from "../store/authStore"
// import { Plus, Truck, Clock, ArrowRight, MapPin } from "lucide-react"
// import { format } from "date-fns"
// import clsx from "clsx"
// import toast from "react-hot-toast"

// const statusColors = {
//   pending: "bg-slate-100 text-slate-700",
//   approved: "bg-blue-100 text-blue-700",
//   in_transit: "bg-amber-100 text-amber-700",
//   delivered: "bg-emerald-100 text-emerald-700",
//   cancelled: "bg-red-100 text-red-700",
// }

// const priorityColors = {
//   low: "bg-slate-100 text-slate-600",
//   normal: "bg-blue-100 text-blue-600",
//   high: "bg-amber-100 text-amber-600",
//   urgent: "bg-red-100 text-red-600",
// }

// export default function Movements() {
//   const [movements, setMovements] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [status, setStatus] = useState("")
//   const [priority, setPriority] = useState("")
//   const { user } = useAuthStore()
//   const navigate = useNavigate()

//   useEffect(() => {
//     fetchMovements()

//     const unsubscribe = socketService.on("movementChanged", () => {
//       fetchMovements()
//     })

//     return unsubscribe
//   }, [status, priority])

//   const fetchMovements = async () => {
//     try {
//       const params = {}
//       if (status) params.status = status
//       if (priority) params.priority = priority

//       const { data } = await movementAPI.getAll(params)
//       setMovements(data.movements)
//     } catch (error) {
//       toast.error("Failed to fetch movements")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Supply Chain</h1>
//           <p className="text-slate-500">Track and manage drug movements</p>
//         </div>
//         {["admin", "warehouse"].includes(user?.role) && (
//           <button onClick={() => navigate("/movements/create")} className="btn btn-primary">
//             <Plus className="w-4 h-4" />
//             Create Movement
//           </button>
//         )}
//       </div>

//       {/* Filters */}
//       <div className="card">
//         <div className="flex flex-wrap gap-4">
//           <div>
//             <label className="label">Status</label>
//             <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
//               <option value="">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="in_transit">In Transit</option>
//               <option value="delivered">Delivered</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>
//           <div>
//             <label className="label">Priority</label>
//             <select value={priority} onChange={(e) => setPriority(e.target.value)} className="input">
//               <option value="">All Priority</option>
//               <option value="low">Low</option>
//               <option value="normal">Normal</option>
//               <option value="high">High</option>
//               <option value="urgent">Urgent</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Movement List */}
//       {loading ? (
//         <div className="flex items-center justify-center py-12">
//           <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
//         </div>
//       ) : movements.length === 0 ? (
//         <div className="card text-center py-12">
//           <Truck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-slate-900">No movements found</h3>
//           <p className="text-slate-500 mt-1">Create a new movement to get started</p>
//         </div>
//       ) : (
//         <div className="grid gap-4">
//           {movements.map((movement) => (
//             <div
//               key={movement._id}
//               className="card hover:shadow-md transition-shadow cursor-pointer"
//               onClick={() => navigate(`/movements/${movement._id}`)}
//             >
//               <div className="flex flex-col lg:flex-row lg:items-center gap-4">
//                 {/* Movement Info */}
//                 <div className="flex-1">
//                   <div className="flex items-start gap-3">
//                     <div className="p-2 bg-primary-100 rounded-lg">
//                       <Truck className="w-5 h-5 text-primary-600" />
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="font-semibold text-slate-900">{movement.movementId}</h3>
//                       <p className="text-sm text-slate-500">
//                         {movement.drug?.name} - {movement.quantity} units
//                       </p>
//                       <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
//                         <MapPin className="w-4 h-4" />
//                         <span className="capitalize">{movement.from.replace("-", " ")}</span>
//                         <ArrowRight className="w-4 h-4" />
//                         <span className="capitalize">{movement.to.replace("-", " ")}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Status & Priority */}
//                 <div className="flex items-center gap-4">
//                   <div className="flex flex-col items-end gap-2">
//                     <span className={clsx("badge", statusColors[movement.status])}>
//                       {movement.status.replace("_", " ")}
//                     </span>
//                     <span className={clsx("badge", priorityColors[movement.priority])}>{movement.priority}</span>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm text-slate-500">{format(new Date(movement.createdAt), "MMM d, yyyy")}</p>
//                     {movement.driver && <p className="text-sm text-slate-600">Driver: {movement.driver.name}</p>}
//                   </div>
//                 </div>
//               </div>

//               {/* Scan History Preview */}
//               {movement.scanHistory?.length > 0 && (
//                 <div className="mt-4 pt-4 border-t border-slate-100">
//                   <div className="flex items-center gap-2 text-sm text-slate-500">
//                     <Clock className="w-4 h-4" />
//                     <span>
//                       Last scan: {movement.scanHistory[movement.scanHistory.length - 1].location} -{" "}
//                       {format(
//                         new Date(movement.scanHistory[movement.scanHistory.length - 1].scannedAt),
//                         "MMM d, h:mm a",
//                       )}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }
