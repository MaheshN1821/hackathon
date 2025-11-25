import { useState, useEffect } from "react";
import { alertAPI } from "../services/api";
import { socketService } from "../services/socket";
import {
	Bell,
	Package,
	Truck,
	Clock,
	CheckCircle,
	AlertTriangle,
	Info,
	Check,
	CheckCheck,
} from "lucide-react";
import { format } from "date-fns";
import clsx from "clsx";
import toast from "react-hot-toast";

const typeIcons = {
	"low-stock": Package,
	expiry: Clock,
	"delivery-delay": Truck,
	reorder: Package,
	movement: Truck,
	system: Bell,
};

const severityConfig = {
	info: {
		bg: "bg-blue-50",
		border: "border-blue-500",
		text: "text-blue-700",
		icon: Info,
		iconBg: "bg-blue-100",
	},
	warning: {
		bg: "bg-amber-50",
		border: "border-amber-500",
		text: "text-amber-700",
		icon: AlertTriangle,
		iconBg: "bg-amber-100",
	},
	critical: {
		bg: "bg-red-50",
		border: "border-red-500",
		text: "text-red-700",
		icon: AlertTriangle,
		iconBg: "bg-red-100",
	},
};

export default function Alerts() {
	const [alerts, setAlerts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState({ type: "", severity: "", isRead: "" });
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		fetchAlerts();

		const unsubscribe = socketService.on("alertReceived", (alert) => {
			setAlerts((prev) => [alert, ...prev]);
		});

		return unsubscribe;
	}, [filter]);

	const fetchAlerts = async () => {
		try {
			const params = {};
			if (filter.type) params.type = filter.type;
			if (filter.severity) params.severity = filter.severity;
			if (filter.isRead) params.isRead = filter.isRead;

			const { data } = await alertAPI.getAll(params);
			setAlerts(data.alerts);
		} catch (error) {
			toast.error("Failed to fetch alerts");
		} finally {
			setLoading(false);
		}
	};

	const handleMarkAsRead = async (alertId) => {
		try {
			await alertAPI.markAsRead(alertId);
			setAlerts((prev) =>
				prev.map((a) => (a._id === alertId ? { ...a, isRead: true } : a))
			);
		} catch (error) {
			toast.error("Failed to mark as read");
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await alertAPI.markAllAsRead();
			setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
			toast.success("All alerts marked as read");
		} catch (error) {
			toast.error("Failed to mark all as read");
		}
	};

	const handleResolve = async (alertId) => {
		try {
			await alertAPI.resolve(alertId);
			setAlerts((prev) =>
				prev.map((a) => (a._id === alertId ? { ...a, isResolved: true } : a))
			);
			toast.success("Alert resolved");
		} catch (error) {
			toast.error("Failed to resolve alert");
		}
	};

	const unreadCount = alerts.filter((a) => !a.isRead).length;
	const criticalCount = alerts.filter(
		(a) => a.severity === "critical" && !a.isResolved
	).length;

	return (
		<div className="space-y-6">
			<div className="page-header">
				<div>
					<h1 className="page-title">Alerts</h1>
					<p className="page-subtitle">
						{unreadCount > 0
							? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
							: "All caught up!"}
					</p>
				</div>
				<div className="flex gap-3">
					{unreadCount > 0 && (
						<button onClick={handleMarkAllAsRead} className="btn btn-secondary">
							<CheckCheck className="w-4 h-4" />
							Mark All as Read
						</button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="card flex items-center gap-4">
					<div className="p-3 bg-slate-100 rounded-xl">
						<Bell className="w-6 h-6 text-slate-600" />
					</div>
					<div>
						<p className="text-2xl font-bold text-slate-900">{alerts.length}</p>
						<p className="text-sm text-slate-500">Total Alerts</p>
					</div>
				</div>
				<div className="card flex items-center gap-4">
					<div className="p-3 bg-blue-100 rounded-xl">
						<Info className="w-6 h-6 text-blue-600" />
					</div>
					<div>
						<p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
						<p className="text-sm text-slate-500">Unread</p>
					</div>
				</div>
				<div className="card flex items-center gap-4">
					<div className="p-3 bg-red-100 rounded-xl">
						<AlertTriangle className="w-6 h-6 text-red-600" />
					</div>
					<div>
						<p className="text-2xl font-bold text-slate-900">{criticalCount}</p>
						<p className="text-sm text-slate-500">Critical</p>
					</div>
				</div>
			</div>

			<div className="card">
				<div className="flex flex-wrap items-center gap-4">
					<div className="flex-1 min-w-[200px]">
						<select
							value={filter.severity}
							onChange={(e) =>
								setFilter({ ...filter, severity: e.target.value })
							}
							className="input"
						>
							<option value="">All Severity</option>
							<option value="info">Info</option>
							<option value="warning">Warning</option>
							<option value="critical">Critical</option>
						</select>
					</div>
					<div className="flex-1 min-w-[200px]">
						<select
							value={filter.type}
							onChange={(e) => setFilter({ ...filter, type: e.target.value })}
							className="input"
						>
							<option value="">All Types</option>
							<option value="low-stock">Low Stock</option>
							<option value="expiry">Expiry</option>
							<option value="delivery-delay">Delivery Delay</option>
							<option value="movement">Movement</option>
							<option value="system">System</option>
						</select>
					</div>
					<div className="flex-1 min-w-[200px]">
						<select
							value={filter.isRead}
							onChange={(e) => setFilter({ ...filter, isRead: e.target.value })}
							className="input"
						>
							<option value="">All Status</option>
							<option value="false">Unread</option>
							<option value="true">Read</option>
						</select>
					</div>
				</div>
			</div>

			{loading ? (
				<div className="space-y-4">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="h-24 skeleton rounded-2xl" />
					))}
				</div>
			) : alerts.length === 0 ? (
				<div className="card empty-state">
					<div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
						<Bell className="w-10 h-10 text-slate-300" />
					</div>
					<h3 className="text-lg font-semibold text-slate-900">No alerts</h3>
					<p className="text-slate-500 mt-1">You're all caught up!</p>
				</div>
			) : (
				<div className="space-y-4">
					{alerts.map((alert, index) => {
						const Icon = typeIcons[alert.type] || Bell;
						const config =
							severityConfig[alert.severity] || severityConfig.info;

						return (
							<div
								key={alert._id}
								className={clsx(
									"card border-l-4 transition-all duration-300 animate-fade-in group",
									config.border,
									config.bg,
									!alert.isRead && "ring-2 ring-primary-100 shadow-lg"
								)}
								style={{ animationDelay: `${index * 50}ms` }}
							>
								<div className="flex items-start gap-4">
									<div className={clsx("p-3 rounded-xl", config.iconBg)}>
										<Icon className={clsx("w-5 h-5", config.text)} />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<h3 className="font-bold text-slate-900">
														{alert.title}
													</h3>
													{!alert.isRead && (
														<span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
													)}
												</div>
												<p className="text-sm text-slate-600 mt-1">
													{alert.message}
												</p>
												<p className="text-xs text-slate-400 mt-2">
													{format(
														new Date(alert.createdAt),
														"MMM d, yyyy h:mm a"
													)}
												</p>
											</div>
											<div className="flex items-center gap-2 shrink-0">
												<span
													className={clsx(
														"badge",
														alert.severity === "critical" && "badge-error",
														alert.severity === "warning" && "badge-warning",
														alert.severity === "info" && "badge-info"
													)}
												>
													{alert.severity}
												</span>
												{alert.isResolved && (
													<span className="badge badge-success">
														<Check className="w-3 h-3" />
														Resolved
													</span>
												)}
											</div>
										</div>
										<div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
											{!alert.isRead && (
												<button
													onClick={() => handleMarkAsRead(alert._id)}
													className="btn btn-ghost text-sm py-1.5 px-3"
												>
													<Check className="w-4 h-4" />
													Mark as read
												</button>
											)}
											{!alert.isResolved && (
												<button
													onClick={() => handleResolve(alert._id)}
													className="btn btn-ghost text-sm py-1.5 px-3 text-emerald-600 hover:bg-emerald-50"
												>
													<CheckCircle className="w-4 h-4" />
													Resolve
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

// import { useState, useEffect } from "react"
// import { alertAPI } from "../services/api"
// import { socketService } from "../services/socket"
// import { Bell, Package, Truck, Clock, CheckCircle } from "lucide-react"
// import { format } from "date-fns"
// import clsx from "clsx"
// import toast from "react-hot-toast"

// const typeIcons = {
//   "low-stock": Package,
//   expiry: Clock,
//   "delivery-delay": Truck,
//   reorder: Package,
//   movement: Truck,
//   system: Bell,
// }

// const severityColors = {
//   info: "bg-blue-50 border-blue-500 text-blue-700",
//   warning: "bg-amber-50 border-amber-500 text-amber-700",
//   critical: "bg-red-50 border-red-500 text-red-700",
// }

// export default function Alerts() {
//   const [alerts, setAlerts] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [filter, setFilter] = useState({ type: "", severity: "", isRead: "" })

//   useEffect(() => {
//     fetchAlerts()

//     const unsubscribe = socketService.on("alertReceived", (alert) => {
//       setAlerts((prev) => [alert, ...prev])
//     })

//     return unsubscribe
//   }, [filter])

//   const fetchAlerts = async () => {
//     try {
//       const params = {}
//       if (filter.type) params.type = filter.type
//       if (filter.severity) params.severity = filter.severity
//       if (filter.isRead) params.isRead = filter.isRead

//       const { data } = await alertAPI.getAll(params)
//       setAlerts(data.alerts)
//     } catch (error) {
//       toast.error("Failed to fetch alerts")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleMarkAsRead = async (alertId) => {
//     try {
//       await alertAPI.markAsRead(alertId)
//       setAlerts((prev) => prev.map((a) => (a._id === alertId ? { ...a, isRead: true } : a)))
//     } catch (error) {
//       toast.error("Failed to mark as read")
//     }
//   }

//   const handleMarkAllAsRead = async () => {
//     try {
//       await alertAPI.markAllAsRead()
//       setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
//       toast.success("All alerts marked as read")
//     } catch (error) {
//       toast.error("Failed to mark all as read")
//     }
//   }

//   const handleResolve = async (alertId) => {
//     try {
//       await alertAPI.resolve(alertId)
//       setAlerts((prev) => prev.map((a) => (a._id === alertId ? { ...a, isResolved: true } : a)))
//       toast.success("Alert resolved")
//     } catch (error) {
//       toast.error("Failed to resolve alert")
//     }
//   }

//   const unreadCount = alerts.filter((a) => !a.isRead).length

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
//           <p className="text-slate-500">{unreadCount > 0 ? `${unreadCount} unread alerts` : "All caught up!"}</p>
//         </div>
//         {unreadCount > 0 && (
//           <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
//             <CheckCircle className="w-4 h-4" />
//             Mark All as Read
//           </button>
//         )}
//       </div>

//       {/* Filters */}
//       <div className="card">
//         <div className="flex flex-wrap gap-4">
//           <div>
//             <label className="label">Type</label>
//             <select
//               value={filter.type}
//               onChange={(e) => setFilter({ ...filter, type: e.target.value })}
//               className="input"
//             >
//               <option value="">All Types</option>
//               <option value="low-stock">Low Stock</option>
//               <option value="expiry">Expiry</option>
//               <option value="delivery-delay">Delivery Delay</option>
//               <option value="movement">Movement</option>
//               <option value="system">System</option>
//             </select>
//           </div>
//           <div>
//             <label className="label">Severity</label>
//             <select
//               value={filter.severity}
//               onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
//               className="input"
//             >
//               <option value="">All Severity</option>
//               <option value="info">Info</option>
//               <option value="warning">Warning</option>
//               <option value="critical">Critical</option>
//             </select>
//           </div>
//           <div>
//             <label className="label">Status</label>
//             <select
//               value={filter.isRead}
//               onChange={(e) => setFilter({ ...filter, isRead: e.target.value })}
//               className="input"
//             >
//               <option value="">All</option>
//               <option value="false">Unread</option>
//               <option value="true">Read</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Alert List */}
//       {loading ? (
//         <div className="flex items-center justify-center py-12">
//           <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
//         </div>
//       ) : alerts.length === 0 ? (
//         <div className="card text-center py-12">
//           <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-slate-900">No alerts</h3>
//           <p className="text-slate-500 mt-1">You're all caught up!</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {alerts.map((alert) => {
//             const Icon = typeIcons[alert.type] || Bell
//             return (
//               <div
//                 key={alert._id}
//                 className={clsx(
//                   "card border-l-4 transition-all",
//                   severityColors[alert.severity],
//                   !alert.isRead && "ring-2 ring-primary-100",
//                 )}
//               >
//                 <div className="flex items-start gap-4">
//                   <div
//                     className={clsx(
//                       "p-2 rounded-lg",
//                       alert.severity === "critical" && "bg-red-100",
//                       alert.severity === "warning" && "bg-amber-100",
//                       alert.severity === "info" && "bg-blue-100",
//                     )}
//                   >
//                     <Icon className="w-5 h-5" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-4">
//                       <div>
//                         <h3 className="font-semibold text-slate-900">{alert.title}</h3>
//                         <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
//                         <p className="text-xs text-slate-400 mt-2">
//                           {format(new Date(alert.createdAt), "MMM d, yyyy h:mm a")}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span
//                           className={clsx(
//                             "badge",
//                             alert.severity === "critical" && "badge-error",
//                             alert.severity === "warning" && "badge-warning",
//                             alert.severity === "info" && "badge-info",
//                           )}
//                         >
//                           {alert.severity}
//                         </span>
//                         {alert.isResolved && <span className="badge badge-success">Resolved</span>}
//                       </div>
//                     </div>
//                     <div className="flex gap-2 mt-3">
//                       {!alert.isRead && (
//                         <button
//                           onClick={() => handleMarkAsRead(alert._id)}
//                           className="text-sm text-primary-600 hover:text-primary-700 font-medium"
//                         >
//                           Mark as read
//                         </button>
//                       )}
//                       {!alert.isResolved && (
//                         <button
//                           onClick={() => handleResolve(alert._id)}
//                           className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
//                         >
//                           Resolve
//                         </button>
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
