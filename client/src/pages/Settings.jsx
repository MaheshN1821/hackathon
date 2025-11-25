import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "../services/api";
import {
	User,
	Mail,
	Phone,
	Save,
	Shield,
	Bell,
	Palette,
	Lock,
	CheckCircle,
	Building2,
	Truck,
	Stethoscope,
} from "lucide-react";
import toast from "react-hot-toast";

const roleIcons = {
	admin: Shield,
	warehouse: Building2,
	pharmacist: Stethoscope,
	driver: Truck,
};

const rolePermissions = {
	admin: [
		"Full system access",
		"User management",
		"All reports & analytics",
		"System configuration",
	],
	warehouse: [
		"Inventory management",
		"Movement creation",
		"Stock reports",
		"Batch management",
	],
	pharmacist: [
		"View inventory",
		"View movements",
		"Basic reports",
		"Drug verification",
	],
	driver: [
		"View assigned movements",
		"Update delivery status",
		"QR scanning",
		"Route information",
	],
};

export default function Settings() {
	const { user, updateUser } = useAuthStore();
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("profile");
	const [formData, setFormData] = useState({
		name: user?.name || "",
		phone: user?.phone || "",
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const { data } = await authAPI.updateProfile(formData);
			updateUser(data.user);
			toast.success("Profile updated successfully");
		} catch (error) {
			toast.error("Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	const RoleIcon = roleIcons[user?.role] || User;

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Settings</h1>
					<p className="text-slate-500">Manage your account and preferences</p>
				</div>
			</div>

			{/* Settings Tabs */}
			<div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
				{[
					{ id: "profile", label: "Profile", icon: User },
					{ id: "notifications", label: "Notifications", icon: Bell },
					{ id: "appearance", label: "Appearance", icon: Palette },
				].map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
							activeTab === tab.id
								? "bg-white text-teal-600 shadow-sm"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<tab.icon className="w-4 h-4" />
						{tab.label}
					</button>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Settings Panel */}
				<div className="lg:col-span-2 space-y-6">
					{activeTab === "profile" && (
						<div className="card-elevated animate-slide-in">
							<div className="flex items-center gap-3 mb-6">
								<div className="icon-box icon-box-lg bg-gradient-to-br from-teal-500 to-cyan-500">
									<User className="w-6 h-6 text-white" />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-slate-900">
										Profile Information
									</h2>
									<p className="text-sm text-slate-500">
										Update your personal details
									</p>
								</div>
							</div>

							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Profile Avatar */}
								<div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
									<div className="relative">
										<div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
											<span className="text-2xl font-bold text-white">
												{user?.name?.charAt(0)?.toUpperCase() || "U"}
											</span>
										</div>
										<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
											<CheckCircle className="w-3 h-3 text-white" />
										</div>
									</div>
									<div>
										<p className="font-semibold text-slate-900">{user?.name}</p>
										<p className="text-sm text-slate-500 capitalize flex items-center gap-1">
											<RoleIcon className="w-4 h-4" />
											{user?.role}
										</p>
										<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 mt-1">
											Active Account
										</span>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Full Name
										</label>
										<div className="relative group">
											<User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
											<input
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												className="input-glass pl-12"
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Email
										</label>
										<div className="relative">
											<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
											<input
												type="email"
												value={user?.email || ""}
												className="input-glass pl-12 bg-slate-50 cursor-not-allowed opacity-60"
												disabled
											/>
										</div>
										<p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
											<Lock className="w-3 h-3" />
											Email cannot be changed
										</p>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Phone
										</label>
										<div className="relative group">
											<Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
											<input
												type="tel"
												name="phone"
												value={formData.phone}
												onChange={handleChange}
												className="input-glass pl-12"
												placeholder="Enter phone number"
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Role
										</label>
										<div className="relative">
											<Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
											<input
												type="text"
												value={user?.role || ""}
												className="input-glass pl-12 bg-slate-50 cursor-not-allowed opacity-60 capitalize"
												disabled
											/>
										</div>
										<p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
											<Lock className="w-3 h-3" />
											Contact admin to change role
										</p>
									</div>
								</div>

								<button
									type="submit"
									disabled={loading}
									className="btn-primary"
								>
									{loading ? (
										<span className="flex items-center gap-2">
											<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
											Saving...
										</span>
									) : (
										<>
											<Save className="w-4 h-4" />
											Save Changes
										</>
									)}
								</button>
							</form>
						</div>
					)}

					{activeTab === "notifications" && (
						<div className="card-elevated animate-slide-in">
							<div className="flex items-center gap-3 mb-6">
								<div className="icon-box icon-box-lg bg-gradient-to-br from-amber-500 to-orange-500">
									<Bell className="w-6 h-6 text-white" />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-slate-900">
										Notification Preferences
									</h2>
									<p className="text-sm text-slate-500">
										Manage how you receive alerts
									</p>
								</div>
							</div>

							<div className="space-y-4">
								{[
									{
										label: "Low Stock Alerts",
										desc: "Get notified when inventory is running low",
										default: true,
									},
									{
										label: "Expiry Warnings",
										desc: "Alerts for drugs approaching expiry date",
										default: true,
									},
									{
										label: "Movement Updates",
										desc: "Status updates for supply chain movements",
										default: true,
									},
									{
										label: "System Announcements",
										desc: "Important platform updates and news",
										default: false,
									},
								].map((item, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
									>
										<div>
											<p className="font-medium text-slate-900">{item.label}</p>
											<p className="text-sm text-slate-500">{item.desc}</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												defaultChecked={item.default}
												className="sr-only peer"
											/>
											<div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
										</label>
									</div>
								))}
							</div>
						</div>
					)}

					{activeTab === "appearance" && (
						<div className="card-elevated animate-slide-in">
							<div className="flex items-center gap-3 mb-6">
								<div className="icon-box icon-box-lg bg-gradient-to-br from-purple-500 to-pink-500">
									<Palette className="w-6 h-6 text-white" />
								</div>
								<div>
									<h2 className="text-lg font-semibold text-slate-900">
										Appearance Settings
									</h2>
									<p className="text-sm text-slate-500">
										Customize your experience
									</p>
								</div>
							</div>

							<div className="space-y-6">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-3">
										Theme
									</label>
									<div className="grid grid-cols-3 gap-3">
										{[
											{
												id: "light",
												label: "Light",
												color: "bg-white border-2 border-slate-200",
											},
											{ id: "dark", label: "Dark", color: "bg-slate-800" },
											{
												id: "auto",
												label: "Auto",
												color: "bg-gradient-to-r from-white to-slate-800",
											},
										].map((theme) => (
											<button
												key={theme.id}
												className={`p-4 rounded-xl border-2 transition-all ${
													theme.id === "light"
														? "border-teal-500 bg-teal-50"
														: "border-slate-200 hover:border-slate-300"
												}`}
											>
												<div
													className={`w-full h-8 rounded-lg ${theme.color} mb-2`}
												></div>
												<p className="text-sm font-medium text-slate-700">
													{theme.label}
												</p>
											</button>
										))}
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-3">
										Accent Color
									</label>
									<div className="flex gap-3">
										{[
											{ color: "bg-teal-500", active: true },
											{ color: "bg-blue-500", active: false },
											{ color: "bg-emerald-500", active: false },
											{ color: "bg-amber-500", active: false },
											{ color: "bg-rose-500", active: false },
										].map((item, index) => (
											<button
												key={index}
												className={`w-10 h-10 rounded-xl ${
													item.color
												} transition-all ${
													item.active
														? "ring-2 ring-offset-2 ring-teal-500"
														: "hover:scale-110"
												}`}
											></button>
										))}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Account Info Sidebar */}
				<div className="space-y-6">
					<div
						className="card-elevated animate-slide-in"
						style={{ animationDelay: "0.1s" }}
					>
						<h2 className="text-lg font-semibold text-slate-900 mb-4">
							Account Status
						</h2>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-slate-600">Status</span>
								<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
									<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
									Active
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-slate-600">Member Since</span>
								<span className="text-slate-900 font-medium">Jan 2024</span>
							</div>
						</div>
					</div>

					<div
						className="card-elevated animate-slide-in"
						style={{ animationDelay: "0.2s" }}
					>
						<div className="flex items-center gap-2 mb-4">
							<RoleIcon className="w-5 h-5 text-teal-600" />
							<h2 className="text-lg font-semibold text-slate-900">
								Role Permissions
							</h2>
						</div>
						<p className="text-sm text-slate-500 mb-4 capitalize">
							{user?.role} Access Level
						</p>
						<div className="space-y-2">
							{rolePermissions[user?.role]?.map((permission, index) => (
								<div
									key={index}
									className="flex items-center gap-2 text-sm text-slate-700"
								>
									<CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
									<span>{permission}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

//above correct

// "use client"

// import { useState } from "react"
// import { useAuthStore } from "../store/authStore"
// import { authAPI } from "../services/api"
// import { User, Mail, Phone, Save, Shield } from "lucide-react"
// import toast from "react-hot-toast"

// export default function Settings() {
//   const { user, updateUser } = useAuthStore()
//   const [loading, setLoading] = useState(false)
//   const [formData, setFormData] = useState({
//     name: user?.name || "",
//     phone: user?.phone || "",
//   })

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const { data } = await authAPI.updateProfile(formData)
//       updateUser(data.user)
//       toast.success("Profile updated successfully")
//     } catch (error) {
//       toast.error("Failed to update profile")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
//         <p className="text-slate-500">Manage your account settings</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Profile Settings */}
//         <div className="lg:col-span-2 card">
//           <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile Information</h2>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
//               <div className="flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full">
//                 <User className="w-8 h-8" />
//               </div>
//               <div>
//                 <p className="font-semibold text-slate-900">{user?.name}</p>
//                 <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="label">Full Name</label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="input pl-10"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="label">Email</label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                   <input type="email" value={user?.email || ""} className="input pl-10 bg-slate-50" disabled />
//                 </div>
//                 <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
//               </div>

//               <div>
//                 <label className="label">Phone</label>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     className="input pl-10"
//                     placeholder="Enter phone number"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="label">Role</label>
//                 <div className="relative">
//                   <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                   <input type="text" value={user?.role || ""} className="input pl-10 bg-slate-50 capitalize" disabled />
//                 </div>
//                 <p className="text-xs text-slate-500 mt-1">Contact admin to change role</p>
//               </div>
//             </div>

//             <button type="submit" disabled={loading} className="btn btn-primary">
//               <Save className="w-4 h-4" />
//               {loading ? "Saving..." : "Save Changes"}
//             </button>
//           </form>
//         </div>

//         {/* Account Info */}
//         <div className="card h-fit">
//           <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
//           <div className="space-y-4">
//             <div>
//               <p className="text-sm text-slate-500">Account Status</p>
//               <span className="badge badge-success">Active</span>
//             </div>
//             <div>
//               <p className="text-sm text-slate-500">Role Permissions</p>
//               <div className="mt-2 space-y-1">
//                 {user?.role === "admin" && (
//                   <>
//                     <p className="text-sm text-slate-700">- Full system access</p>
//                     <p className="text-sm text-slate-700">- User management</p>
//                     <p className="text-sm text-slate-700">- All reports</p>
//                   </>
//                 )}
//                 {user?.role === "warehouse" && (
//                   <>
//                     <p className="text-sm text-slate-700">- Inventory management</p>
//                     <p className="text-sm text-slate-700">- Movement creation</p>
//                     <p className="text-sm text-slate-700">- Stock reports</p>
//                   </>
//                 )}
//                 {user?.role === "pharmacist" && (
//                   <>
//                     <p className="text-sm text-slate-700">- View inventory</p>
//                     <p className="text-sm text-slate-700">- View movements</p>
//                     <p className="text-sm text-slate-700">- Basic reports</p>
//                   </>
//                 )}
//                 {user?.role === "driver" && (
//                   <>
//                     <p className="text-sm text-slate-700">- View assigned movements</p>
//                     <p className="text-sm text-slate-700">- Update delivery status</p>
//                     <p className="text-sm text-slate-700">- QR scanning</p>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
