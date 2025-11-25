import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reportAPI, alertAPI } from "../services/api";
import { socketService } from "../services/socket";
import { useAuthStore } from "../store/authStore";
import {
	Package,
	Truck,
	AlertTriangle,
	Clock,
	ArrowRight,
	TrendingUp,
	TrendingDown,
	Activity,
	Plus,
	Bell,
	ChevronRight,
} from "lucide-react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import clsx from "clsx";

const COLORS = [
	"#00a6a6",
	"#0ea5e9",
	"#8b5cf6",
	"#f59e0b",
	"#ef4444",
	"#10b981",
];

export default function Dashboard() {
	const [stats, setStats] = useState(null);
	const [recentAlerts, setRecentAlerts] = useState([]);
	const [loading, setLoading] = useState(true);
	const { user } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		fetchDashboardData();

		const unsubscribe = socketService.on("stockUpdated", () => {
			fetchDashboardData();
		});

		return unsubscribe;
	}, []);

	const fetchDashboardData = async () => {
		try {
			const [dashboardRes, alertsRes] = await Promise.all([
				reportAPI.getDashboard(),
				alertAPI.getAll({ limit: 5, isRead: false }),
			]);
			setStats(dashboardRes.data.stats);
			setRecentAlerts(alertsRes.data.alerts);
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-24 skeleton rounded-2xl" />
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-32 skeleton rounded-2xl" />
					))}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="h-80 skeleton rounded-2xl" />
					<div className="h-80 skeleton rounded-2xl" />
				</div>
			</div>
		);
	}

	const categoryData = stats?.inventory?.byCategory
		? Object.entries(stats.inventory.byCategory || {}).map(([name, data]) => ({
				name: name.charAt(0).toUpperCase() + name.slice(1),
				value: data.quantity,
		  }))
		: [];

	const movementData = [
		{
			name: "Pending",
			value: stats?.movements?.pending || 0,
			color: "#94a3b8",
		},
		{
			name: "In Transit",
			value: stats?.movements?.inTransit || 0,
			color: "#f59e0b",
		},
		{
			name: "Delivered",
			value: stats?.movements?.delivered || 0,
			color: "#10b981",
		},
	];

	return (
		<div className="space-y-8">
			<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-500 via-primary-600 to-teal-500 p-8 text-white">
				{/* Background decoration */}
				<div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
				<div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

				<div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
					<div>
						<div className="flex items-center gap-2 text-white/80 text-sm mb-2">
							<Activity className="w-4 h-4" />
							<span>Dashboard Overview</span>
						</div>
						<h1 className="text-3xl lg:text-4xl font-bold">
							Welcome back, {user?.name?.split(" ")[0]}!
						</h1>
						<p className="text-white/80 mt-2 max-w-lg">
							Here's what's happening with your inventory today. You have{" "}
							<span className="font-semibold text-white">
								{stats?.inventory?.lowStock || 0} items
							</span>{" "}
							that need attention.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						{["admin", "warehouse"].includes(user?.role) && (
							<button
								onClick={() => navigate("/inventory/add")}
								className="btn bg-white text-primary-600 hover:bg-white/90 shadow-lg shadow-primary-900/20"
							>
								<Plus className="w-4 h-4" />
								Add Drug
							</button>
						)}
						<button
							onClick={() => navigate("/movements/create")}
							className="btn bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20"
						>
							<Truck className="w-4 h-4" />
							Create Movement
						</button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					icon={Package}
					label="Total Drugs"
					value={stats?.inventory?.totalDrugs || 0}
					subtext={`${
						stats?.inventory?.totalQuantity?.toLocaleString() || 0
					} units in stock`}
					color="primary"
					trend={{ value: 12, positive: true }}
				/>
				<StatCard
					icon={AlertTriangle}
					label="Low Stock"
					value={stats?.inventory?.lowStock || 0}
					subtext={`${stats?.inventory?.outOfStock || 0} out of stock`}
					color="warning"
					trend={{ value: 3, positive: false }}
				/>
				<StatCard
					icon={Clock}
					label="Expiring Soon"
					value={stats?.inventory?.expiringSoon || 0}
					subtext="Within 30 days"
					color="danger"
					onClick={() => navigate("/inventory?status=expiring")}
				/>
				<StatCard
					icon={Truck}
					label="In Transit"
					value={stats?.movements?.inTransit || 0}
					subtext={`${stats?.movements?.pending || 0} pending approval`}
					color="info"
					onClick={() => navigate("/movements?status=in_transit")}
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Movement Status Chart */}
				<div className="card card-hover">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-bold text-slate-900">
								Movement Status
							</h3>
							<p className="text-sm text-slate-500">
								Current shipment overview
							</p>
						</div>
						<button
							onClick={() => navigate("/movements")}
							className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
						>
							View all
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
					<div className="h-[280px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={movementData}
									cx="50%"
									cy="50%"
									innerRadius={70}
									outerRadius={110}
									paddingAngle={4}
									dataKey="value"
									strokeWidth={0}
								>
									{movementData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: "white",
										border: "none",
										borderRadius: "12px",
										boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
										padding: "12px 16px",
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="flex justify-center gap-6 mt-4">
						{movementData.map((item) => (
							<div key={item.name} className="flex items-center gap-2">
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: item.color }}
								/>
								<span className="text-sm text-slate-600">
									{item.name}:{" "}
									<span className="font-semibold">{item.value}</span>
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Category Distribution Chart */}
				<div className="card card-hover">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-bold text-slate-900">
								Category Distribution
							</h3>
							<p className="text-sm text-slate-500">
								Inventory by drug category
							</p>
						</div>
						<button
							onClick={() => navigate("/inventory")}
							className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
						>
							View all
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
					<div className="h-[300px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={categoryData} layout="vertical">
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#e2e8f0"
									horizontal={false}
								/>
								<XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} />
								<YAxis
									dataKey="name"
									type="category"
									tick={{ fontSize: 12, fill: "#64748b" }}
									width={100}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: "white",
										border: "none",
										borderRadius: "12px",
										boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
										padding: "12px 16px",
									}}
								/>
								<Bar
									dataKey="value"
									fill="#00a6a6"
									radius={[0, 8, 8, 0]}
									barSize={24}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="card card-hover">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-red-100 rounded-xl">
							<Bell className="w-5 h-5 text-red-600" />
						</div>
						<div>
							<h3 className="text-lg font-bold text-slate-900">
								Recent Alerts
							</h3>
							<p className="text-sm text-slate-500">
								{recentAlerts.length > 0
									? `${recentAlerts.length} alerts need attention`
									: "All caught up!"}
							</p>
						</div>
					</div>
					<button
						onClick={() => navigate("/alerts")}
						className="btn btn-secondary"
					>
						View all
						<ArrowRight className="w-4 h-4" />
					</button>
				</div>

				{recentAlerts.length === 0 ? (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Bell className="w-8 h-8 text-slate-300" />
						</div>
						<h4 className="font-medium text-slate-900">No new alerts</h4>
						<p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
					</div>
				) : (
					<div className="space-y-3">
						{recentAlerts.map((alert, index) => (
							<div
								key={alert._id}
								className={clsx(
									"p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer animate-fade-in",
									alert.severity === "critical" &&
										"bg-red-50/80 border-red-500 hover:bg-red-50",
									alert.severity === "warning" &&
										"bg-amber-50/80 border-amber-500 hover:bg-amber-50",
									alert.severity === "info" &&
										"bg-blue-50/80 border-blue-500 hover:bg-blue-50"
								)}
								style={{ animationDelay: `${index * 100}ms` }}
								onClick={() => navigate("/alerts")}
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<p className="font-semibold text-slate-900">
											{alert.title}
										</p>
										<p className="text-sm text-slate-600 mt-1 line-clamp-1">
											{alert.message}
										</p>
									</div>
									<span
										className={clsx(
											"badge shrink-0",
											alert.severity === "critical" && "badge-error",
											alert.severity === "warning" && "badge-warning",
											alert.severity === "info" && "badge-info"
										)}
									>
										{alert.severity}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
	subtext,
	color,
	trend,
	onClick,
}) {
	const colorClasses = {
		primary: {
			icon: "bg-primary-100 text-primary-600",
			gradient: "from-primary-500/10 to-transparent",
		},
		warning: {
			icon: "bg-amber-100 text-amber-600",
			gradient: "from-amber-500/10 to-transparent",
		},
		danger: {
			icon: "bg-red-100 text-red-600",
			gradient: "from-red-500/10 to-transparent",
		},
		info: {
			icon: "bg-blue-100 text-blue-600",
			gradient: "from-blue-500/10 to-transparent",
		},
		success: {
			icon: "bg-emerald-100 text-emerald-600",
			gradient: "from-emerald-500/10 to-transparent",
		},
	};

	const classes = colorClasses[color] || colorClasses.primary;

	return (
		<div
			onClick={onClick}
			className={clsx(
				"card card-hover relative overflow-hidden group",
				onClick && "cursor-pointer"
			)}
		>
			{/* Background gradient */}
			<div
				className={clsx(
					"absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150",
					classes.gradient
				)}
			/>

			<div className="relative z-10 flex items-start justify-between">
				<div>
					<p className="text-sm text-slate-500 font-medium">{label}</p>
					<p className="text-3xl font-bold text-slate-900 mt-2">
						{value.toLocaleString()}
					</p>
					{subtext && <p className="text-sm text-slate-400 mt-1">{subtext}</p>}
					{trend && (
						<div
							className={clsx(
								"flex items-center gap-1 mt-2 text-sm font-medium",
								trend.positive ? "text-emerald-600" : "text-red-600"
							)}
						>
							{trend.positive ? (
								<TrendingUp className="w-4 h-4" />
							) : (
								<TrendingDown className="w-4 h-4" />
							)}
							<span>{trend.value}% from last week</span>
						</div>
					)}
				</div>
				<div className={clsx("p-3 rounded-xl", classes.icon)}>
					<Icon className="w-6 h-6" />
				</div>
			</div>
		</div>
	);
}

// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { reportAPI, alertAPI } from "../services/api"
// import { socketService } from "../services/socket"
// import { useAuthStore } from "../store/authStore"
// import { Package, Truck, AlertTriangle, Clock, ArrowRight } from "lucide-react"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
// import clsx from "clsx"

// const COLORS = ["#00a6a6", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981"]

// export default function Dashboard() {
//   const [stats, setStats] = useState(null)
//   const [recentAlerts, setRecentAlerts] = useState([])
//   const [loading, setLoading] = useState(true)
//   const { user } = useAuthStore()
//   const navigate = useNavigate()

//   useEffect(() => {
//     fetchDashboardData()

//     const unsubscribe = socketService.on("stockUpdated", () => {
//       fetchDashboardData()
//     })

//     return unsubscribe
//   }, [])

//   const fetchDashboardData = async () => {
//     try {
//       const [dashboardRes, alertsRes] = await Promise.all([
//         reportAPI.getDashboard(),
//         alertAPI.getAll({ limit: 5, isRead: false }),
//       ])
//       setStats(dashboardRes.data.stats)
//       setRecentAlerts(alertsRes.data.alerts)
//     } catch (error) {
//       console.error("Failed to fetch dashboard data:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
//       </div>
//     )
//   }

//   const categoryData = stats?.inventory?.byCategory
//     ? Object.entries(stats.inventory.byCategory || {}).map(([name, data]) => ({
//         name: name.charAt(0).toUpperCase() + name.slice(1),
//         value: data.quantity,
//       }))
//     : []

//   const movementData = [
//     { name: "Pending", value: stats?.movements?.pending || 0 },
//     { name: "In Transit", value: stats?.movements?.inTransit || 0 },
//     { name: "Delivered", value: stats?.movements?.delivered || 0 },
//   ]

//   return (
//     <div className="space-y-6">
//       {/* Welcome message */}
//       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(" ")[0]}!</h1>
//           <p className="text-slate-500">Here's what's happening with your inventory today.</p>
//         </div>
//         <div className="flex gap-3">
//           {["admin", "warehouse"].includes(user?.role) && (
//             <button onClick={() => navigate("/inventory/add")} className="btn btn-primary">
//               Add Drug
//             </button>
//           )}
//           <button onClick={() => navigate("/movements/create")} className="btn btn-secondary">
//             Create Movement
//           </button>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard
//           icon={Package}
//           label="Total Drugs"
//           value={stats?.inventory?.totalDrugs || 0}
//           subtext={`${stats?.inventory?.totalQuantity || 0} units`}
//           color="primary"
//         />
//         <StatCard
//           icon={AlertTriangle}
//           label="Low Stock"
//           value={stats?.inventory?.lowStock || 0}
//           subtext={`${stats?.inventory?.outOfStock || 0} out of stock`}
//           color="warning"
//         />
//         <StatCard
//           icon={Clock}
//           label="Expiring Soon"
//           value={stats?.inventory?.expiringSoon || 0}
//           subtext="Within 30 days"
//           color="danger"
//         />
//         <StatCard
//           icon={Truck}
//           label="In Transit"
//           value={stats?.movements?.inTransit || 0}
//           subtext={`${stats?.movements?.pending || 0} pending`}
//           color="info"
//         />
//       </div>

//       {/* Charts Row */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Movement Status Chart */}
//         <div className="card">
//           <h3 className="text-lg font-semibold text-slate-900 mb-4">Movement Status</h3>
//           <div className="h-[250px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={movementData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={100}
//                   paddingAngle={5}
//                   dataKey="value"
//                 >
//                   {movementData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//           <div className="flex justify-center gap-6 mt-4">
//             {movementData.map((item, index) => (
//               <div key={item.name} className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
//                 <span className="text-sm text-slate-600">
//                   {item.name}: {item.value}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Category Distribution Chart */}
//         <div className="card">
//           <h3 className="text-lg font-semibold text-slate-900 mb-4">Category Distribution</h3>
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={categoryData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                 <XAxis dataKey="name" tick={{ fontSize: 12 }} />
//                 <YAxis tick={{ fontSize: 12 }} />
//                 <Tooltip />
//                 <Bar dataKey="value" fill="#00a6a6" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* Recent Alerts */}
//       <div className="card">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-slate-900">Recent Alerts</h3>
//           <button
//             onClick={() => navigate("/alerts")}
//             className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
//           >
//             View all <ArrowRight className="w-4 h-4" />
//           </button>
//         </div>

//         {recentAlerts.length === 0 ? (
//           <p className="text-slate-500 text-center py-8">No new alerts</p>
//         ) : (
//           <div className="space-y-3">
//             {recentAlerts.map((alert) => (
//               <div
//                 key={alert._id}
//                 className={clsx(
//                   "p-4 rounded-lg border-l-4",
//                   alert.severity === "critical" && "bg-red-50 border-red-500",
//                   alert.severity === "warning" && "bg-amber-50 border-amber-500",
//                   alert.severity === "info" && "bg-blue-50 border-blue-500",
//                 )}
//               >
//                 <div className="flex items-start justify-between gap-4">
//                   <div>
//                     <p className="font-medium text-slate-900">{alert.title}</p>
//                     <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
//                   </div>
//                   <span
//                     className={clsx(
//                       "badge",
//                       alert.severity === "critical" && "badge-error",
//                       alert.severity === "warning" && "badge-warning",
//                       alert.severity === "info" && "badge-info",
//                     )}
//                   >
//                     {alert.severity}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// function StatCard({ icon: Icon, label, value, subtext, color }) {
//   const colorClasses = {
//     primary: "bg-primary-100 text-primary-600",
//     warning: "bg-amber-100 text-amber-600",
//     danger: "bg-red-100 text-red-600",
//     info: "bg-blue-100 text-blue-600",
//     success: "bg-emerald-100 text-emerald-600",
//   }

//   return (
//     <div className="card">
//       <div className="flex items-start justify-between">
//         <div>
//           <p className="text-sm text-slate-500 font-medium">{label}</p>
//           <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
//           {subtext && <p className="text-sm text-slate-400 mt-1">{subtext}</p>}
//         </div>
//         <div className={clsx("p-3 rounded-xl", colorClasses[color])}>
//           <Icon className="w-6 h-6" />
//         </div>
//       </div>
//     </div>
//   )
// }
