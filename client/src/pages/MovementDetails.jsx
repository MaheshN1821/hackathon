import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { movementAPI, authAPI } from "../services/api";
import { socketService } from "../services/socket";
import { useAuthStore } from "../store/authStore";
import {
	ArrowLeft,
	Truck,
	MapPin,
	User,
	Package,
	CheckCircle,
	XCircle,
	Play,
	QrCode,
	Clock,
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

export default function MovementDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuthStore();

	const [movement, setMovement] = useState(null);
	const [loading, setLoading] = useState(true);
	const [drivers, setDrivers] = useState([]);
	const [selectedDriver, setSelectedDriver] = useState("");
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		fetchMovement();
		if (["admin", "warehouse"].includes(user?.role)) {
			fetchDrivers();
		}

		const unsubscribe = socketService.on("movementStatusChanged", (data) => {
			if (data.movementId === movement?.movementId) {
				fetchMovement();
			}
		});

		return unsubscribe;
	}, [id]);

	const fetchMovement = async () => {
		try {
			const { data } = await movementAPI.getById(id);
			setMovement(data.movement);
			setSelectedDriver(data.movement.driver?._id || "");
		} catch (error) {
			toast.error("Failed to fetch movement details");
			navigate("/movements");
		} finally {
			setLoading(false);
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

	const handleStatusUpdate = async (newStatus) => {
		setUpdating(true);
		try {
			await movementAPI.updateStatus(id, { status: newStatus });
			toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
			fetchMovement();
		} catch (error) {
			toast.error("Failed to update status");
		} finally {
			setUpdating(false);
		}
	};

	const handleAssignDriver = async () => {
		if (!selectedDriver) {
			toast.error("Please select a driver");
			return;
		}

		setUpdating(true);
		try {
			await movementAPI.assignDriver(id, { driverId: selectedDriver });
			toast.success("Driver assigned successfully");
			fetchMovement();
		} catch (error) {
			toast.error("Failed to assign driver");
		} finally {
			setUpdating(false);
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-16 skeleton rounded-2xl" />
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<div className="h-40 skeleton rounded-2xl" />
						<div className="h-32 skeleton rounded-2xl" />
						<div className="h-48 skeleton rounded-2xl" />
					</div>
					<div className="space-y-6">
						<div className="h-48 skeleton rounded-2xl" />
						<div className="h-40 skeleton rounded-2xl" />
					</div>
				</div>
			</div>
		);
	}

	if (!movement) return null;

	const statusStyles = statusConfig[movement.status] || statusConfig.pending;
	const canApprove =
		["admin", "warehouse"].includes(user?.role) &&
		movement.status === "pending";
	const canStartTransit =
		["admin", "warehouse", "driver"].includes(user?.role) &&
		movement.status === "approved";
	const canDeliver =
		["admin", "warehouse", "driver"].includes(user?.role) &&
		movement.status === "in_transit";
	const canCancel =
		["admin"].includes(user?.role) &&
		!["delivered", "cancelled"].includes(movement.status);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<button
					onClick={() => navigate("/movements")}
					className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold text-slate-900">
							{movement.movementId}
						</h1>
						<span
							className={clsx(
								"badge text-sm",
								statusStyles.bg,
								statusStyles.text
							)}
						>
							<span
								className={clsx("w-2 h-2 rounded-full", statusStyles.dot)}
							/>
							{movement.status.replace("_", " ")}
						</span>
					</div>
					<p className="text-slate-500">Movement Details</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Info */}
				<div className="lg:col-span-2 space-y-6">
					<div className="card">
						<h2 className="text-lg font-bold text-slate-900 mb-6">
							Route Information
						</h2>
						<div className="flex items-center gap-4">
							<div className="flex-1 p-5 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl text-center">
								<div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
									<MapPin className="w-6 h-6 text-primary-500" />
								</div>
								<p className="text-sm text-primary-600/70 font-medium">From</p>
								<p className="font-bold text-primary-700 capitalize mt-1">
									{movement.from.replace("-", " ")}
								</p>
							</div>
							<div className="flex flex-col items-center gap-2">
								<div className="h-0.5 w-12 bg-slate-200 rounded-full" />
								<div className="p-3 bg-slate-100 rounded-xl">
									<Truck className="w-6 h-6 text-slate-500" />
								</div>
								<div className="h-0.5 w-12 bg-slate-200 rounded-full" />
							</div>
							<div className="flex-1 p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl text-center">
								<div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
									<MapPin className="w-6 h-6 text-emerald-500" />
								</div>
								<p className="text-sm text-emerald-600/70 font-medium">To</p>
								<p className="font-bold text-emerald-700 capitalize mt-1">
									{movement.to.replace("-", " ")}
								</p>
							</div>
						</div>
					</div>

					<div className="card">
						<h2 className="text-lg font-bold text-slate-900 mb-6">
							Drug Information
						</h2>
						<div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
							<div className="p-4 bg-white rounded-xl shadow-sm">
								<Package className="w-8 h-8 text-primary-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-bold text-slate-900 text-lg">
									{movement.drug?.name}
								</h3>
								<p className="text-sm text-slate-500">
									{movement.drug?.drugId} - Batch: {movement.drug?.batchNo}
								</p>
							</div>
							<div className="text-right">
								<p className="text-3xl font-bold text-slate-900">
									{movement.quantity}
								</p>
								<p className="text-sm text-slate-500">units</p>
							</div>
						</div>
					</div>

					<div className="card">
						<h2 className="text-lg font-bold text-slate-900 mb-6">
							Scan History
						</h2>
						{movement.scanHistory?.length === 0 ? (
							<div className="text-center py-8">
								<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
									<Clock className="w-8 h-8 text-slate-300" />
								</div>
								<p className="text-slate-500">No scans recorded yet</p>
							</div>
						) : (
							<div className="space-y-1">
								{movement.scanHistory?.map((scan, index) => (
									<div
										key={index}
										className="timeline-item animate-fade-in"
										style={{ animationDelay: `${index * 100}ms` }}
									>
										<div className="timeline-dot">
											<MapPin className="w-3 h-3 text-white" />
										</div>
										<div className="p-4 bg-slate-50 rounded-xl">
											<p className="font-semibold text-slate-900 capitalize">
												{scan.location.replace("-", " ")}
											</p>
											<p className="text-sm text-slate-500 mt-1">
												{format(new Date(scan.scannedAt), "MMM d, yyyy h:mm a")}
											</p>
											{scan.notes && (
												<p className="text-sm text-slate-600 mt-2 p-2 bg-white rounded-lg">
													{scan.notes}
												</p>
											)}
											{scan.scannedBy && (
												<p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
													<User className="w-3 h-3" />
													{scan.scannedBy.name || scan.scannedBy}
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<div className="card">
						<h2 className="text-lg font-bold text-slate-900 mb-4">Actions</h2>
						<div className="space-y-3">
							{canApprove && (
								<button
									onClick={() => handleStatusUpdate("approved")}
									disabled={updating}
									className="btn btn-primary w-full"
								>
									<CheckCircle className="w-4 h-4" />
									Approve Movement
								</button>
							)}
							{canStartTransit && (
								<button
									onClick={() => handleStatusUpdate("in_transit")}
									disabled={updating}
									className="btn btn-primary w-full"
								>
									<Play className="w-4 h-4" />
									Start Transit
								</button>
							)}
							{canDeliver && (
								<button
									onClick={() => handleStatusUpdate("delivered")}
									disabled={updating}
									className="btn btn-primary w-full"
								>
									<CheckCircle className="w-4 h-4" />
									Mark Delivered
								</button>
							)}
							{canCancel && (
								<button
									onClick={() => handleStatusUpdate("cancelled")}
									disabled={updating}
									className="btn btn-danger w-full"
								>
									<XCircle className="w-4 h-4" />
									Cancel Movement
								</button>
							)}
							<button
								onClick={() => navigate("/scanner")}
								className="btn btn-secondary w-full"
							>
								<QrCode className="w-4 h-4" />
								Scan QR Code
							</button>
						</div>
					</div>

					{["admin", "warehouse"].includes(user?.role) && (
						<div className="card">
							<h2 className="text-lg font-bold text-slate-900 mb-4">
								Driver Assignment
							</h2>
							{movement.driver ? (
								<div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
									<div className="p-3 bg-primary-100 rounded-xl">
										<User className="w-5 h-5 text-primary-600" />
									</div>
									<div>
										<p className="font-semibold text-slate-900">
											{movement.driver.name}
										</p>
										<p className="text-sm text-slate-500">
											{movement.driver.phone}
										</p>
									</div>
								</div>
							) : (
								<div className="space-y-3">
									<select
										value={selectedDriver}
										onChange={(e) => setSelectedDriver(e.target.value)}
										className="input"
									>
										<option value="">Select Driver</option>
										{drivers.map((driver) => (
											<option key={driver._id} value={driver._id}>
												{driver.name}
											</option>
										))}
									</select>
									<button
										onClick={handleAssignDriver}
										disabled={updating || !selectedDriver}
										className="btn btn-primary w-full"
									>
										Assign Driver
									</button>
								</div>
							)}
						</div>
					)}

					<div className="card">
						<h2 className="text-lg font-bold text-slate-900 mb-4">Details</h2>
						<div className="space-y-3">
							<div className="flex justify-between py-2 border-b border-slate-100">
								<span className="text-slate-500">Priority</span>
								<span className="font-semibold text-slate-900 capitalize">
									{movement.priority}
								</span>
							</div>
							<div className="flex justify-between py-2 border-b border-slate-100">
								<span className="text-slate-500">Created</span>
								<span className="font-semibold text-slate-900">
									{format(new Date(movement.createdAt), "MMM d, yyyy")}
								</span>
							</div>
							{movement.expectedDelivery && (
								<div className="flex justify-between py-2 border-b border-slate-100">
									<span className="text-slate-500">Expected</span>
									<span className="font-semibold text-slate-900">
										{format(new Date(movement.expectedDelivery), "MMM d, yyyy")}
									</span>
								</div>
							)}
							{movement.actualDelivery && (
								<div className="flex justify-between py-2 border-b border-slate-100">
									<span className="text-slate-500">Delivered</span>
									<span className="font-semibold text-emerald-600">
										{format(new Date(movement.actualDelivery), "MMM d, yyyy")}
									</span>
								</div>
							)}
							{movement.createdBy && (
								<div className="flex justify-between py-2">
									<span className="text-slate-500">Created By</span>
									<span className="font-semibold text-slate-900">
										{movement.createdBy.name}
									</span>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// import { useState, useEffect } from "react"
// import { useParams, useNavigate } from "react-router-dom"
// import { movementAPI, authAPI } from "../services/api"
// import { socketService } from "../services/socket"
// import { useAuthStore } from "../store/authStore"
// import { ArrowLeft, Truck, MapPin, User, Package, CheckCircle, XCircle, Play, QrCode } from "lucide-react"
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

// export default function MovementDetails() {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const { user } = useAuthStore()

//   const [movement, setMovement] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [drivers, setDrivers] = useState([])
//   const [selectedDriver, setSelectedDriver] = useState("")
//   const [updating, setUpdating] = useState(false)

//   useEffect(() => {
//     fetchMovement()
//     if (["admin", "warehouse"].includes(user?.role)) {
//       fetchDrivers()
//     }

//     const unsubscribe = socketService.on("movementStatusChanged", (data) => {
//       if (data.movementId === movement?.movementId) {
//         fetchMovement()
//       }
//     })

//     return unsubscribe
//   }, [id])

//   const fetchMovement = async () => {
//     try {
//       const { data } = await movementAPI.getById(id)
//       setMovement(data.movement)
//       setSelectedDriver(data.movement.driver?._id || "")
//     } catch (error) {
//       toast.error("Failed to fetch movement details")
//       navigate("/movements")
//     } finally {
//       setLoading(false)
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

//   const handleStatusUpdate = async (newStatus) => {
//     setUpdating(true)
//     try {
//       await movementAPI.updateStatus(id, { status: newStatus })
//       toast.success(`Status updated to ${newStatus.replace("_", " ")}`)
//       fetchMovement()
//     } catch (error) {
//       toast.error("Failed to update status")
//     } finally {
//       setUpdating(false)
//     }
//   }

//   const handleAssignDriver = async () => {
//     if (!selectedDriver) {
//       toast.error("Please select a driver")
//       return
//     }

//     setUpdating(true)
//     try {
//       await movementAPI.assignDriver(id, { driverId: selectedDriver })
//       toast.success("Driver assigned successfully")
//       fetchMovement()
//     } catch (error) {
//       toast.error("Failed to assign driver")
//     } finally {
//       setUpdating(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
//       </div>
//     )
//   }

//   if (!movement) return null

//   const canApprove = ["admin", "warehouse"].includes(user?.role) && movement.status === "pending"
//   const canStartTransit = ["admin", "warehouse", "driver"].includes(user?.role) && movement.status === "approved"
//   const canDeliver = ["admin", "warehouse", "driver"].includes(user?.role) && movement.status === "in_transit"
//   const canCancel = ["admin"].includes(user?.role) && !["delivered", "cancelled"].includes(movement.status)

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <button onClick={() => navigate("/movements")} className="p-2 hover:bg-slate-100 rounded-lg">
//           <ArrowLeft className="w-5 h-5" />
//         </button>
//         <div className="flex-1">
//           <h1 className="text-2xl font-bold text-slate-900">{movement.movementId}</h1>
//           <p className="text-slate-500">Movement Details</p>
//         </div>
//         <span className={clsx("badge text-sm", statusColors[movement.status])}>
//           {movement.status.replace("_", " ")}
//         </span>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Main Info */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Route Info */}
//           <div className="card">
//             <h2 className="text-lg font-semibold text-slate-900 mb-4">Route Information</h2>
//             <div className="flex items-center gap-4">
//               <div className="flex-1 p-4 bg-slate-50 rounded-lg text-center">
//                 <MapPin className="w-6 h-6 text-primary-500 mx-auto mb-2" />
//                 <p className="text-sm text-slate-500">From</p>
//                 <p className="font-semibold text-slate-900 capitalize">{movement.from.replace("-", " ")}</p>
//               </div>
//               <div className="flex-shrink-0">
//                 <Truck className="w-8 h-8 text-slate-400" />
//               </div>
//               <div className="flex-1 p-4 bg-slate-50 rounded-lg text-center">
//                 <MapPin className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
//                 <p className="text-sm text-slate-500">To</p>
//                 <p className="font-semibold text-slate-900 capitalize">{movement.to.replace("-", " ")}</p>
//               </div>
//             </div>
//           </div>

//           {/* Drug Info */}
//           <div className="card">
//             <h2 className="text-lg font-semibold text-slate-900 mb-4">Drug Information</h2>
//             <div className="flex items-center gap-4">
//               <div className="p-3 bg-primary-100 rounded-lg">
//                 <Package className="w-6 h-6 text-primary-600" />
//               </div>
//               <div className="flex-1">
//                 <h3 className="font-semibold text-slate-900">{movement.drug?.name}</h3>
//                 <p className="text-sm text-slate-500">
//                   {movement.drug?.drugId} - Batch: {movement.drug?.batchNo}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <p className="text-2xl font-bold text-slate-900">{movement.quantity}</p>
//                 <p className="text-sm text-slate-500">units</p>
//               </div>
//             </div>
//           </div>

//           {/* Timeline */}
//           <div className="card">
//             <h2 className="text-lg font-semibold text-slate-900 mb-4">Scan History</h2>
//             {movement.scanHistory?.length === 0 ? (
//               <p className="text-slate-500 text-center py-4">No scans recorded yet</p>
//             ) : (
//               <div className="space-y-4">
//                 {movement.scanHistory?.map((scan, index) => (
//                   <div key={index} className="flex gap-4">
//                     <div className="flex flex-col items-center">
//                       <div className="w-3 h-3 bg-primary-500 rounded-full" />
//                       {index < movement.scanHistory.length - 1 && <div className="w-0.5 h-full bg-slate-200 my-1" />}
//                     </div>
//                     <div className="flex-1 pb-4">
//                       <p className="font-medium text-slate-900 capitalize">{scan.location.replace("-", " ")}</p>
//                       <p className="text-sm text-slate-500">{format(new Date(scan.scannedAt), "MMM d, yyyy h:mm a")}</p>
//                       {scan.notes && <p className="text-sm text-slate-600 mt-1">{scan.notes}</p>}
//                       {scan.scannedBy && (
//                         <p className="text-xs text-slate-400 mt-1">By: {scan.scannedBy.name || scan.scannedBy}</p>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* Actions */}
//           <div className="card">
//             <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions</h2>
//             <div className="space-y-3">
//               {canApprove && (
//                 <button
//                   onClick={() => handleStatusUpdate("approved")}
//                   disabled={updating}
//                   className="btn btn-primary w-full"
//                 >
//                   <CheckCircle className="w-4 h-4" />
//                   Approve Movement
//                 </button>
//               )}
//               {canStartTransit && (
//                 <button
//                   onClick={() => handleStatusUpdate("in_transit")}
//                   disabled={updating}
//                   className="btn btn-primary w-full"
//                 >
//                   <Play className="w-4 h-4" />
//                   Start Transit
//                 </button>
//               )}
//               {canDeliver && (
//                 <button
//                   onClick={() => handleStatusUpdate("delivered")}
//                   disabled={updating}
//                   className="btn btn-primary w-full"
//                 >
//                   <CheckCircle className="w-4 h-4" />
//                   Mark Delivered
//                 </button>
//               )}
//               {canCancel && (
//                 <button
//                   onClick={() => handleStatusUpdate("cancelled")}
//                   disabled={updating}
//                   className="btn btn-danger w-full"
//                 >
//                   <XCircle className="w-4 h-4" />
//                   Cancel Movement
//                 </button>
//               )}
//               <button onClick={() => navigate("/scanner")} className="btn btn-secondary w-full">
//                 <QrCode className="w-4 h-4" />
//                 Scan QR Code
//               </button>
//             </div>
//           </div>

//           {/* Driver Assignment */}
//           {["admin", "warehouse"].includes(user?.role) && (
//             <div className="card">
//               <h2 className="text-lg font-semibold text-slate-900 mb-4">Driver Assignment</h2>
//               {movement.driver ? (
//                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
//                   <div className="p-2 bg-primary-100 rounded-full">
//                     <User className="w-5 h-5 text-primary-600" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-slate-900">{movement.driver.name}</p>
//                     <p className="text-sm text-slate-500">{movement.driver.phone}</p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} className="input">
//                     <option value="">Select Driver</option>
//                     {drivers.map((driver) => (
//                       <option key={driver._id} value={driver._id}>
//                         {driver.name}
//                       </option>
//                     ))}
//                   </select>
//                   <button
//                     onClick={handleAssignDriver}
//                     disabled={updating || !selectedDriver}
//                     className="btn btn-primary w-full"
//                   >
//                     Assign Driver
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Details */}
//           <div className="card">
//             <h2 className="text-lg font-semibold text-slate-900 mb-4">Details</h2>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-slate-500">Priority</span>
//                 <span className="font-medium text-slate-900 capitalize">{movement.priority}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-slate-500">Created</span>
//                 <span className="font-medium text-slate-900">
//                   {format(new Date(movement.createdAt), "MMM d, yyyy")}
//                 </span>
//               </div>
//               {movement.expectedDelivery && (
//                 <div className="flex justify-between">
//                   <span className="text-slate-500">Expected</span>
//                   <span className="font-medium text-slate-900">
//                     {format(new Date(movement.expectedDelivery), "MMM d, yyyy")}
//                   </span>
//                 </div>
//               )}
//               {movement.actualDelivery && (
//                 <div className="flex justify-between">
//                   <span className="text-slate-500">Delivered</span>
//                   <span className="font-medium text-emerald-600">
//                     {format(new Date(movement.actualDelivery), "MMM d, yyyy")}
//                   </span>
//                 </div>
//               )}
//               {movement.createdBy && (
//                 <div className="flex justify-between">
//                   <span className="text-slate-500">Created By</span>
//                   <span className="font-medium text-slate-900">{movement.createdBy.name}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
