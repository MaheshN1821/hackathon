import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { alertAPI } from "../services/api";
import { socketService } from "../services/socket";
import {
	LayoutDashboard,
	Package,
	Truck,
	Bell,
	FileText,
	QrCode,
	Settings,
	LogOut,
	Menu,
	X,
	ChevronDown,
	User,
	Activity,
	Search,
	ChevronRight,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
	{
		path: "/dashboard",
		icon: LayoutDashboard,
		label: "Dashboard",
		roles: ["admin", "warehouse", "pharmacist", "driver"],
	},
	{
		path: "/inventory",
		icon: Package,
		label: "Inventory",
		roles: ["admin", "warehouse", "pharmacist"],
	},
	{
		path: "/movements",
		icon: Truck,
		label: "Supply Chain",
		roles: ["admin", "warehouse", "pharmacist", "driver"],
	},
	{
		path: "/alerts",
		icon: Bell,
		label: "Alerts",
		roles: ["admin", "warehouse", "pharmacist", "driver"],
	},
	{
		path: "/reports",
		icon: FileText,
		label: "Reports",
		roles: ["admin", "warehouse", "pharmacist"],
	},
	{
		path: "/scanner",
		icon: QrCode,
		label: "QR Scanner",
		roles: ["admin", "warehouse", "pharmacist", "driver"],
	},
	{
		path: "/settings",
		icon: Settings,
		label: "Settings",
		roles: ["admin", "warehouse", "pharmacist", "driver"],
	},
];

export default function DashboardLayout() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [unreadAlerts, setUnreadAlerts] = useState(0);
	const [searchOpen, setSearchOpen] = useState(false);
	const { user, logout } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();

	const filteredNavItems = navItems.filter((item) =>
		item.roles.includes(user?.role)
	);

	useEffect(() => {
		fetchUnreadAlerts();

		const unsubscribe = socketService.on("alertReceived", () => {
			setUnreadAlerts((prev) => prev + 1);
		});

		return unsubscribe;
	}, []);

	const fetchUnreadAlerts = async () => {
		try {
			const { data } = await alertAPI.getAll({ isRead: false, limit: 1 });
			setUnreadAlerts(data.unreadCount || 0);
		} catch (error) {
			console.error("Failed to fetch alerts:", error);
		}
	};

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const currentPageTitle =
		navItems.find((item) => item.path === location.pathname)?.label ||
		"Dashboard";

	return (
		<div className="min-h-screen gradient-bg">
			{/* Mobile sidebar backdrop */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<aside
				className={clsx(
					"fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 transform transition-all duration-300 ease-out lg:translate-x-0 shadow-2xl lg:shadow-none",
					sidebarOpen ? "translate-x-0" : "-translate-x-full",
					sidebarCollapsed ? "lg:w-20" : "lg:w-72",
					"w-72"
				)}
			>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="flex items-center justify-between h-20 px-6 border-b border-slate-200/60">
						<div
							className={clsx(
								"flex items-center gap-3 transition-all duration-300",
								sidebarCollapsed && "lg:justify-center"
							)}
						>
							<div className="relative">
								<div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/30">
									<Activity className="w-6 h-6 text-white" />
								</div>
								<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
							</div>
							{!sidebarCollapsed && (
								<div className="animate-fade-in">
									<span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
										DISS
									</span>
									<p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
										Drug Inventory System
									</p>
								</div>
							)}
						</div>
						<button
							onClick={() => setSidebarOpen(false)}
							className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					<button
						onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
						className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110"
					>
						<ChevronRight
							className={clsx(
								"w-3 h-3 text-slate-400 transition-transform duration-300",
								sidebarCollapsed ? "" : "rotate-180"
							)}
						/>
					</button>

					{/* Navigation */}
					<nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
						{filteredNavItems.map((item, index) => (
							<NavLink
								key={item.path}
								to={item.path}
								onClick={() => setSidebarOpen(false)}
								className={({ isActive }) =>
									clsx(
										"group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
										sidebarCollapsed && "lg:justify-center lg:px-2",
										isActive
											? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
											: "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
									)
								}
								style={{ animationDelay: `${index * 50}ms` }}
							>
								<item.icon
									className={clsx(
										"w-5 h-5 transition-transform duration-200 group-hover:scale-110",
										sidebarCollapsed && "lg:w-6 lg:h-6"
									)}
								/>
								{!sidebarCollapsed && (
									<>
										<span>{item.label}</span>
										{item.path === "/alerts" && unreadAlerts > 0 && (
											<span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse">
												{unreadAlerts > 99 ? "99+" : unreadAlerts}
											</span>
										)}
									</>
								)}
								{sidebarCollapsed &&
									item.path === "/alerts" &&
									unreadAlerts > 0 && (
										<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
									)}
							</NavLink>
						))}
					</nav>

					<div className="p-4 border-t border-slate-200/60">
						<div
							className={clsx(
								"flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/50 transition-all duration-300",
								sidebarCollapsed && "lg:justify-center lg:p-2"
							)}
						>
							<div className="relative">
								<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md">
									<User className="w-5 h-5 text-white" />
								</div>
								<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
							</div>
							{!sidebarCollapsed && (
								<div className="flex-1 min-w-0 animate-fade-in">
									<p className="text-sm font-semibold text-slate-900 truncate">
										{user?.name}
									</p>
									<p className="text-xs text-slate-500 capitalize flex items-center gap-1">
										<span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
										{user?.role}
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<div
				className={clsx(
					"transition-all duration-300",
					sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
				)}
			>
				<header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
					<div className="flex items-center justify-between h-20 px-4 lg:px-8">
						<div className="flex items-center gap-4">
							<button
								onClick={() => setSidebarOpen(true)}
								className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
							>
								<Menu className="w-5 h-5" />
							</button>

							<div className="hidden lg:block">
								<h1 className="text-xl font-bold text-slate-900">
									{currentPageTitle}
								</h1>
								<p className="text-sm text-slate-500">
									{new Date().toLocaleDateString("en-US", {
										weekday: "long",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<button
								onClick={() => setSearchOpen(!searchOpen)}
								className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
							>
								<Search className="w-5 h-5" />
							</button>

							<button
								onClick={() => navigate("/alerts")}
								className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
							>
								<Bell className="w-5 h-5" />
								{unreadAlerts > 0 && (
									<>
										<span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full" />
										<span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
									</>
								)}
							</button>

							<div className="relative">
								<button
									onClick={() => setUserMenuOpen(!userMenuOpen)}
									className="flex items-center gap-3 p-2 pl-2 pr-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
								>
									<div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-sm">
										<User className="w-4 h-4 text-white" />
									</div>
									<ChevronDown
										className={clsx(
											"w-4 h-4 transition-transform duration-200",
											userMenuOpen && "rotate-180"
										)}
									/>
								</button>

								{userMenuOpen && (
									<>
										<div
											className="fixed inset-0 z-40"
											onClick={() => setUserMenuOpen(false)}
										/>
										<div className="absolute right-0 z-50 mt-2 w-56 py-2 bg-white rounded-2xl shadow-xl border border-slate-200/60 animate-scale-in origin-top-right">
											<div className="px-4 py-3 border-b border-slate-100">
												<p className="text-sm font-semibold text-slate-900">
													{user?.name}
												</p>
												<p className="text-xs text-slate-500">{user?.email}</p>
											</div>
											<div className="py-1">
												<button
													onClick={() => {
														setUserMenuOpen(false);
														navigate("/settings");
													}}
													className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
												>
													<Settings className="w-4 h-4" />
													Settings
												</button>
												<button
													onClick={handleLogout}
													className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
												>
													<LogOut className="w-4 h-4" />
													Logout
												</button>
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					</div>

					{searchOpen && (
						<div className="absolute inset-x-0 top-full bg-white border-b border-slate-200 p-4 animate-fade-in">
							<div className="max-w-2xl mx-auto">
								<div className="relative">
									<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
									<input
										type="text"
										placeholder="Search drugs, movements, alerts..."
										className="input pl-12 pr-4"
										autoFocus
									/>
								</div>
							</div>
						</div>
					)}
				</header>

				{/* Page content */}
				<main className="p-4 lg:p-8 animate-fade-in">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

// import { useState, useEffect } from "react";
// import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
// import { useAuthStore } from "../store/authStore";
// import { alertAPI } from "../services/api";
// import { socketService } from "../services/socket";
// import {
// 	LayoutDashboard,
// 	Package,
// 	Truck,
// 	Bell,
// 	FileText,
// 	QrCode,
// 	Settings,
// 	LogOut,
// 	Menu,
// 	X,
// 	ChevronDown,
// 	User,
// 	Activity,
// } from "lucide-react";
// import clsx from "clsx";

// const navItems = [
// 	{
// 		path: "/dashboard",
// 		icon: LayoutDashboard,
// 		label: "Dashboard",
// 		roles: ["admin", "warehouse", "pharmacist", "driver"],
// 	},
// 	{
// 		path: "/inventory",
// 		icon: Package,
// 		label: "Inventory",
// 		roles: ["admin", "warehouse", "pharmacist"],
// 	},
// 	{
// 		path: "/movements",
// 		icon: Truck,
// 		label: "Supply Chain",
// 		roles: ["admin", "warehouse", "pharmacist", "driver"],
// 	},
// 	{
// 		path: "/alerts",
// 		icon: Bell,
// 		label: "Alerts",
// 		roles: ["admin", "warehouse", "pharmacist", "driver"],
// 	},
// 	{
// 		path: "/reports",
// 		icon: FileText,
// 		label: "Reports",
// 		roles: ["admin", "warehouse", "pharmacist"],
// 	},
// 	{
// 		path: "/scanner",
// 		icon: QrCode,
// 		label: "QR Scanner",
// 		roles: ["admin", "warehouse", "pharmacist", "driver"],
// 	},
// 	{
// 		path: "/settings",
// 		icon: Settings,
// 		label: "Settings",
// 		roles: ["admin", "warehouse", "pharmacist", "driver"],
// 	},
// ];

// export default function DashboardLayout() {
// 	const [sidebarOpen, setSidebarOpen] = useState(false);
// 	const [userMenuOpen, setUserMenuOpen] = useState(false);
// 	const [unreadAlerts, setUnreadAlerts] = useState(0);
// 	const { user, logout } = useAuthStore();
// 	const navigate = useNavigate();
// 	const location = useLocation();

// 	const filteredNavItems = navItems.filter((item) =>
// 		item.roles.includes(user?.role)
// 	);

// 	useEffect(() => {
// 		fetchUnreadAlerts();

// 		const unsubscribe = socketService.on("alertReceived", () => {
// 			setUnreadAlerts((prev) => prev + 1);
// 		});

// 		return unsubscribe;
// 	}, []);

// 	const fetchUnreadAlerts = async () => {
// 		try {
// 			const { data } = await alertAPI.getAll({ isRead: false, limit: 1 });
// 			setUnreadAlerts(data.unreadCount || 0);
// 		} catch (error) {
// 			console.error("Failed to fetch alerts:", error);
// 		}
// 	};

// 	const handleLogout = () => {
// 		logout();
// 		navigate("/login");
// 	};

// 	return (
// 		<div className="min-h-screen bg-slate-50">
// 			{/* Mobile sidebar backdrop */}
// 			{sidebarOpen && (
// 				<div
// 					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
// 					onClick={() => setSidebarOpen(false)}
// 				/>
// 			)}

// 			{/* Sidebar */}
// 			<aside
// 				className={clsx(
// 					"fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 transform transition-transform duration-200 lg:translate-x-0",
// 					sidebarOpen ? "translate-x-0" : "-translate-x-full"
// 				)}
// 			>
// 				<div className="flex flex-col h-full">
// 					{/* Logo */}
// 					<div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
// 						<div className="flex items-center gap-3">
// 							<div className="p-2 bg-primary-500 rounded-lg">
// 								<Activity className="w-5 h-5 text-white" />
// 							</div>
// 							<span className="text-lg font-bold text-white">DISS</span>
// 						</div>
// 						<button
// 							onClick={() => setSidebarOpen(false)}
// 							className="p-1 text-slate-400 hover:text-white lg:hidden"
// 						>
// 							<X className="w-5 h-5" />
// 						</button>
// 					</div>

// 					{/* Navigation */}
// 					<nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
// 						{filteredNavItems.map((item) => (
// 							<NavLink
// 								key={item.path}
// 								to={item.path}
// 								onClick={() => setSidebarOpen(false)}
// 								className={({ isActive }) =>
// 									clsx(
// 										"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
// 										isActive
// 											? "bg-primary-500 text-white"
// 											: "text-slate-300 hover:bg-slate-700/50 hover:text-white"
// 									)
// 								}
// 							>
// 								<item.icon className="w-5 h-5" />
// 								<span>{item.label}</span>
// 								{item.path === "/alerts" && unreadAlerts > 0 && (
// 									<span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
// 										{unreadAlerts > 99 ? "99+" : unreadAlerts}
// 									</span>
// 								)}
// 							</NavLink>
// 						))}
// 					</nav>

// 					{/* User info */}
// 					<div className="p-3 border-t border-slate-700">
// 						<div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-700/30">
// 							<div className="flex items-center justify-center w-9 h-9 bg-primary-500 rounded-full">
// 								<User className="w-5 h-5 text-white" />
// 							</div>
// 							<div className="flex-1 min-w-0">
// 								<p className="text-sm font-medium text-white truncate">
// 									{user?.name}
// 								</p>
// 								<p className="text-xs text-slate-400 capitalize">
// 									{user?.role}
// 								</p>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</aside>

// 			{/* Main content */}
// 			<div className="lg:pl-64">
// 				{/* Header */}
// 				<header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200">
// 					<div className="flex items-center justify-between h-full px-4 lg:px-6">
// 						<button
// 							onClick={() => setSidebarOpen(true)}
// 							className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden"
// 						>
// 							<Menu className="w-5 h-5" />
// 						</button>

// 						<div className="hidden lg:block">
// 							<h1 className="text-lg font-semibold text-slate-900">
// 								{navItems.find((item) => item.path === location.pathname)
// 									?.label || "Dashboard"}
// 							</h1>
// 						</div>

// 						<div className="flex items-center gap-3">
// 							{/* Alerts button */}
// 							<button
// 								onClick={() => navigate("/alerts")}
// 								className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
// 							>
// 								<Bell className="w-5 h-5" />
// 								{unreadAlerts > 0 && (
// 									<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
// 								)}
// 							</button>

// 							{/* User menu */}
// 							<div className="relative">
// 								<button
// 									onClick={() => setUserMenuOpen(!userMenuOpen)}
// 									className="flex items-center gap-2 p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
// 								>
// 									<div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full">
// 										<User className="w-4 h-4" />
// 									</div>
// 									<ChevronDown className="w-4 h-4" />
// 								</button>

// 								{userMenuOpen && (
// 									<>
// 										<div
// 											className="fixed inset-0 z-40"
// 											onClick={() => setUserMenuOpen(false)}
// 										/>
// 										<div className="absolute right-0 z-50 mt-2 w-48 py-1 bg-white rounded-lg shadow-lg border border-slate-200">
// 											<div className="px-4 py-2 border-b border-slate-100">
// 												<p className="text-sm font-medium text-slate-900">
// 													{user?.name}
// 												</p>
// 												<p className="text-xs text-slate-500">{user?.email}</p>
// 											</div>
// 											<button
// 												onClick={() => {
// 													setUserMenuOpen(false);
// 													navigate("/settings");
// 												}}
// 												className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
// 											>
// 												<Settings className="w-4 h-4" />
// 												Settings
// 											</button>
// 											<button
// 												onClick={handleLogout}
// 												className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
// 											>
// 												<LogOut className="w-4 h-4" />
// 												Logout
// 											</button>
// 										</div>
// 									</>
// 								)}
// 							</div>
// 						</div>
// 					</div>
// 				</header>

// 				{/* Page content */}
// 				<main className="p-4 lg:p-6">
// 					<Outlet />
// 				</main>
// 			</div>
// 		</div>
// 	);
// }
