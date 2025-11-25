import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";
import {
	Activity,
	Mail,
	Lock,
	User,
	Phone,
	Eye,
	EyeOff,
	Shield,
	Truck,
	Building2,
	Stethoscope,
	CheckCircle,
} from "lucide-react";

const roles = [
	{
		value: "pharmacist",
		label: "Pharmacist",
		icon: Stethoscope,
		description: "Manage prescriptions & inventory",
	},
	{
		value: "warehouse",
		label: "Warehouse Manager",
		icon: Building2,
		description: "Handle storage & distribution",
	},
	{
		value: "driver",
		label: "Driver",
		icon: Truck,
		description: "Transport & delivery operations",
	},
	{
		value: "admin",
		label: "Administrator",
		icon: Shield,
		description: "Full system access & management",
	},
];

export default function Register() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "pharmacist",
		phone: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState(1);
	const navigate = useNavigate();
	const { login } = useAuthStore();

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.name || !formData.email || !formData.password) {
			toast.error("Please fill in all required fields");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (formData.password.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}

		setLoading(true);
		try {
			const { data } = await authAPI.register({
				name: formData.name,
				email: formData.email,
				password: formData.password,
				role: formData.role,
				phone: formData.phone,
			});
			login(data.user, data.token);
			toast.success("Account created successfully!");
			navigate("/dashboard");
		} catch (error) {
			toast.error(error.response?.data?.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	const nextStep = () => {
		if (step === 1 && (!formData.name || !formData.email)) {
			toast.error("Please fill in name and email");
			return;
		}
		setStep(2);
	};

	return (
		<div className="min-h-screen flex">
			{/* Left Panel - Branding */}
			<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 p-12 flex-col justify-between relative overflow-hidden">
				{/* Animated Background Elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
					<div
						className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"
						style={{ animationDelay: "1s" }}
					></div>
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse-slow"></div>
				</div>

				{/* Logo */}
				<div className="relative z-10 flex items-center gap-3">
					<div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
						<Activity className="w-8 h-8 text-white" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-white">DISS</h1>
						<p className="text-sm text-white/80">
							Drug Inventory & Supply System
						</p>
					</div>
				</div>

				{/* Center Content */}
				<div className="relative z-10 space-y-5">
					<div>
						<h2 className="text-4xl font-bold text-white mb-4">
							Join Our Platform
						</h2>
						<p className="text-xl text-white/90">
							Be part of the healthcare supply chain revolution
						</p>
					</div>

					<div className="space-y-4">
						{[
							{ icon: Shield, text: "Secure & compliant platform" },
							{ icon: Truck, text: "Real-time tracking system" },
							{ icon: CheckCircle, text: "Easy role-based access" },
						].map((item, index) => (
							<div
								key={index}
								className="flex items-center gap-3 text-white/90 animate-fade-in"
								style={{ animationDelay: `${index * 0.2}s` }}
							>
								<div className="p-2 bg-white/20 rounded-lg">
									<item.icon className="w-5 h-5" />
								</div>
								<span>{item.text}</span>
							</div>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="relative z-10">
					<p className="text-white/60 text-sm">
						Trusted by healthcare providers nationwide
					</p>
				</div>
			</div>

			{/* Right Panel - Register Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100">
				<div className="w-full max-w-md animate-fade-in">
					{/* Mobile Logo */}
					<div className="lg:hidden flex items-center justify-center gap-3 mb-8">
						<div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
							<Activity className="w-8 h-8 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-slate-900">DISS</h1>
							<p className="text-sm text-slate-500">
								Drug Inventory & Supply System
							</p>
						</div>
					</div>

					{/* Progress Steps */}
					<div className="flex items-center justify-center gap-4 mb-8">
						<div
							className={`flex items-center gap-2 ${
								step >= 1 ? "text-teal-600" : "text-slate-400"
							}`}
						>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
									step >= 1
										? "bg-teal-500 text-white"
										: "bg-slate-200 text-slate-500"
								}`}
							>
								1
							</div>
							<span className="text-sm font-medium hidden sm:block">
								Basic Info
							</span>
						</div>
						<div
							className={`w-12 h-0.5 ${
								step >= 2 ? "bg-teal-500" : "bg-slate-200"
							} transition-all`}
						></div>
						<div
							className={`flex items-center gap-2 ${
								step >= 2 ? "text-teal-600" : "text-slate-400"
							}`}
						>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
									step >= 2
										? "bg-teal-500 text-white"
										: "bg-slate-200 text-slate-500"
								}`}
							>
								2
							</div>
							<span className="text-sm font-medium hidden sm:block">
								Security
							</span>
						</div>
					</div>

					{/* Register Card */}
					<div className="card-glass p-8">
						<h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
							Create Account
						</h2>
						<p className="text-slate-500 text-center mb-6">
							{step === 1
								? "Enter your basic information"
								: "Set up your password"}
						</p>

						<form onSubmit={handleSubmit} className="space-y-5">
							{step === 1 ? (
								<>
									<div className="animate-slide-in">
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Full Name *
										</label>
										<div className="relative group">
											<User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
											<input
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												className="input pl-12"
												placeholder="Enter your full name"
											/>
										</div>
									</div>

									<div
										className="animate-slide-in"
										style={{ animationDelay: "0.1s" }}
									>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Email *
										</label>
										<div className="relative group">
											<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
											<input
												type="email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												className="input pl-12"
												placeholder="Enter your email"
											/>
										</div>
									</div>

									<div
										className="animate-slide-in"
										style={{ animationDelay: "0.2s" }}
									>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Phone (Optional)
										</label>
										<div className="relative group">
											<Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
											<input
												type="tel"
												name="phone"
												value={formData.phone}
												onChange={handleChange}
												className="input pl-12"
												placeholder="Enter phone number"
											/>
										</div>
									</div>

									<div
										className="animate-slide-in"
										style={{ animationDelay: "0.3s" }}
									>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Select Role
										</label>
										<div className="grid grid-cols-2 gap-3">
											{roles.map((role) => (
												<button
													key={role.value}
													type="button"
													onClick={() =>
														setFormData({ ...formData, role: role.value })
													}
													className={`p-3 rounded-xl border-2 text-left transition-all ${
														formData.role === role.value
															? "border-teal-500 bg-teal-50"
															: "border-slate-200 hover:border-slate-300 bg-white"
													}`}
												>
													<role.icon
														className={`w-5 h-5 mb-1 ${
															formData.role === role.value
																? "text-teal-600"
																: "text-slate-400"
														}`}
													/>
													<p
														className={`text-sm font-medium ${
															formData.role === role.value
																? "text-teal-700"
																: "text-slate-700"
														}`}
													>
														{role.label}
													</p>
												</button>
											))}
										</div>
									</div>

									<button
										type="button"
										onClick={nextStep}
										className="btn-primary w-full py-3"
									>
										Continue
									</button>
								</>
							) : (
								<>
									<div className="animate-slide-in">
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Password *
										</label>
										<div className="relative group">
											<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
											<input
												type={showPassword ? "text" : "password"}
												name="password"
												value={formData.password}
												onChange={handleChange}
												className="input pl-12 pr-12"
												placeholder="Create a password"
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
											>
												{showPassword ? (
													<EyeOff className="w-5 h-5" />
												) : (
													<Eye className="w-5 h-5" />
												)}
											</button>
										</div>
										<p className="text-xs text-slate-500 mt-1">
											Must be at least 6 characters
										</p>
									</div>

									<div
										className="animate-slide-in"
										style={{ animationDelay: "0.1s" }}
									>
										<label className="block text-sm font-medium text-slate-700 mb-2">
											Confirm Password *
										</label>
										<div className="relative group">
											<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
											<input
												type="password"
												name="confirmPassword"
												value={formData.confirmPassword}
												onChange={handleChange}
												className="input pl-12"
												placeholder="Confirm your password"
											/>
										</div>
									</div>

									{/* Password Match Indicator */}
									{formData.password && formData.confirmPassword && (
										<div
											className={`flex items-center gap-2 text-sm animate-fade-in ${
												formData.password === formData.confirmPassword
													? "text-emerald-600"
													: "text-red-500"
											}`}
										>
											{formData.password === formData.confirmPassword ? (
												<>
													<CheckCircle className="w-4 h-4" />
													<span>Passwords match</span>
												</>
											) : (
												<>
													<span>Passwords do not match</span>
												</>
											)}
										</div>
									)}

									<div className="flex gap-3">
										<button
											type="button"
											onClick={() => setStep(1)}
											className="btn-secondary flex-1 py-3"
										>
											Back
										</button>
										<button
											type="submit"
											disabled={loading}
											className="btn-primary flex-1 py-3"
										>
											{loading ? (
												<span className="flex items-center justify-center gap-2">
													<span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
													Creating...
												</span>
											) : (
												"Create Account"
											)}
										</button>
									</div>
								</>
							)}
						</form>

						<p className="text-center text-sm text-slate-500 mt-6">
							Already have an account?{" "}
							<Link
								to="/login"
								className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
							>
								Sign In
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

//above correct

// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { useAuthStore } from "../store/authStore"
// import { authAPI } from "../services/api"
// import toast from "react-hot-toast"
// import { Activity, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react"

// export default function Register() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     role: "pharmacist",
//     phone: "",
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()
//   const { login } = useAuthStore()

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!formData.name || !formData.email || !formData.password) {
//       toast.error("Please fill in all required fields")
//       return
//     }

//     if (formData.password !== formData.confirmPassword) {
//       toast.error("Passwords do not match")
//       return
//     }

//     if (formData.password.length < 6) {
//       toast.error("Password must be at least 6 characters")
//       return
//     }

//     setLoading(true)
//     try {
//       const { data } = await authAPI.register({
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         role: formData.role,
//         phone: formData.phone,
//       })
//       login(data.user, data.token)
//       toast.success("Account created successfully!")
//       navigate("/dashboard")
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Registration failed")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 p-4">
//       <div className="w-full max-w-md">
//         {/* Logo */}
//         <div className="flex items-center justify-center gap-3 mb-8">
//           <div className="p-3 bg-primary-500 rounded-xl">
//             <Activity className="w-8 h-8 text-white" />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-white">DISS</h1>
//             <p className="text-sm text-slate-400">Drug Inventory & Supply System</p>
//           </div>
//         </div>

//         {/* Register Card */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Create Account</h2>
//           <p className="text-slate-500 text-center mb-6">Join the DISS platform</p>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="label">Full Name *</label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="input pl-10"
//                   placeholder="Enter your name"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="label">Email *</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="input pl-10"
//                   placeholder="Enter your email"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="label">Role</label>
//               <select name="role" value={formData.role} onChange={handleChange} className="input">
//                 <option value="pharmacist">Pharmacist</option>
//                 <option value="warehouse">Warehouse Manager</option>
//                 <option value="driver">Driver</option>
//                 <option value="admin">Administrator</option>
//               </select>
//             </div>

//             <div>
//               <label className="label">Phone</label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className="input pl-10"
//                   placeholder="Enter phone number"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="label">Password *</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="input pl-10 pr-10"
//                   placeholder="Create password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label className="label">Confirm Password *</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="input pl-10"
//                   placeholder="Confirm password"
//                 />
//               </div>
//             </div>

//             <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
//               {loading ? "Creating account..." : "Create Account"}
//             </button>
//           </form>

//           <p className="text-center text-sm text-slate-500 mt-6">
//             Already have an account?{" "}
//             <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
//               Sign In
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }
