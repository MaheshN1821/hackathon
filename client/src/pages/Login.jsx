import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";
import {
	Activity,
	Mail,
	Lock,
	Eye,
	EyeOff,
	ArrowRight,
	Shield,
	Zap,
	Users,
} from "lucide-react";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuthStore();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email || !password) {
			toast.error("Please enter email and password");
			return;
		}

		setLoading(true);
		try {
			const { data } = await authAPI.login({ email, password });
			login(data.user, data.token);
			toast.success("Welcome back!");
			navigate("/dashboard");
		} catch (error) {
			toast.error(error.response?.data?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	const features = [
		{
			icon: Shield,
			label: "Secure & Compliant",
			desc: "HIPAA compliant drug tracking",
		},
		{ icon: Zap, label: "Real-time Updates", desc: "Instant inventory alerts" },
		{
			icon: Users,
			label: "Team Collaboration",
			desc: "Multi-role access control",
		},
	];

	return (
		<div className="min-h-screen flex">
			{/* Left side - Branding */}
			<div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-primary-500 to-teal-400 p-12 flex-col justify-between overflow-hidden">
				{/* Background patterns */}
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
					<div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
				</div>

				{/* Grid pattern overlay */}
				<div
					className="absolute inset-0 opacity-5"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}
				/>

				<div className="relative z-10">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
							<Activity className="w-8 h-8 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-white">DISS</h1>
							<p className="text-sm text-white/70">
								Drug Inventory & Supply System
							</p>
						</div>
					</div>
				</div>

				<div className="relative z-10 space-y-8">
					<div>
						<h2 className="text-4xl font-bold text-white leading-tight">
							Streamline Your
							<br />
							Drug Supply Chain
						</h2>
						<p className="mt-4 text-lg text-white/80 max-w-md">
							Track, manage, and optimize your pharmaceutical inventory with
							real-time insights and intelligent alerts.
						</p>
					</div>

					<div className="space-y-4">
						{features.map((feature, index) => (
							<div
								key={feature.label}
								className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl animate-fade-in"
								style={{ animationDelay: `${index * 150}ms` }}
							>
								<div className="p-2.5 bg-white/20 rounded-xl">
									<feature.icon className="w-5 h-5 text-white" />
								</div>
								<div>
									<p className="font-semibold text-white">{feature.label}</p>
									<p className="text-sm text-white/70">{feature.desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="relative z-10">
					<p className="text-sm text-white/60">
						Trusted by 500+ healthcare facilities worldwide
					</p>
				</div>
			</div>

			{/* Right side - Login form */}
			<div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
				<div className="w-full max-w-md">
					{/* Mobile logo */}
					<div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
						<div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30">
							<Activity className="w-8 h-8 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-slate-900">DISS</h1>
							<p className="text-xs text-slate-500">
								Drug Inventory & Supply System
							</p>
						</div>
					</div>

					<div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-gray-300">
						<div className="text-center mb-8">
							<h2 className="text-2xl font-bold text-slate-900">
								Welcome Back
							</h2>
							<p className="text-slate-500 mt-2">
								Sign in to access your dashboard
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-2">
								<label className="label">Email Address</label>
								<div className="relative group">
									<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="input pl-12"
										placeholder="Enter your email"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label className="label">Password</label>
								<div className="relative group">
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
									<input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="input pl-12 pr-12"
										placeholder="Enter your password"
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
							</div>

							<button
								type="submit"
								disabled={loading}
								className="btn btn-primary w-full py-3.5 text-base group"
							>
								{loading ? (
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								) : (
									<>
										Sign In
										<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
									</>
								)}
							</button>
						</form>

						<p className="text-center text-sm text-slate-500 mt-6">
							Don't have an account?{" "}
							<Link
								to="/register"
								className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
							>
								Register
							</Link>
						</p>
					</div>

					{/* <div className="mt-6 p-5 bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl border border-slate-200">
						<p className="text-sm font-semibold text-slate-700 text-center mb-3">
							Demo Accounts
						</p>
						<div className="grid grid-cols-2 gap-2 text-sm">
							{["admin", "warehouse", "pharmacist", "driver"].map((role) => (
								<button
									key={role}
									onClick={() => {
										setEmail(`${role}@diss.com`);
										setPassword("password123");
									}}
									className="px-3 py-2 bg-white rounded-lg text-slate-600 hover:text-primary-600 hover:bg-primary-50 transition-colors text-left border border-slate-200 hover:border-primary-200"
								>
									<span className="capitalize font-medium">{role}</span>
									<span className="text-xs text-slate-400 block">
										@diss.com
									</span>
								</button>
							))}
						</div>
						<p className="text-xs text-slate-400 text-center mt-3">
							Password:{" "}
							<span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded">
								password123
							</span>
						</p>
					</div> */}
				</div>
			</div>
		</div>
	);
}

// import { useState } from "react"
// import { Link, useNavigate } from "react-router-dom"
// import { useAuthStore } from "../store/authStore"
// import { authAPI } from "../services/api"
// import toast from "react-hot-toast"
// import { Activity, Mail, Lock, Eye, EyeOff } from "lucide-react"

// export default function Login() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [showPassword, setShowPassword] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()
//   const { login } = useAuthStore()

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (!email || !password) {
//       toast.error("Please enter email and password")
//       return
//     }

//     setLoading(true)
//     try {
//       const { data } = await authAPI.login({ email, password })
//       login(data.user, data.token)
//       toast.success("Welcome back!")
//       navigate("/dashboard")
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed")
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

//         {/* Login Card */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Welcome Back</h2>
//           <p className="text-slate-500 text-center mb-6">Sign in to your account</p>

//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="label">Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="input pl-10"
//                   placeholder="Enter your email"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="label">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="input pl-10 pr-10"
//                   placeholder="Enter your password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
//               {loading ? "Signing in..." : "Sign In"}
//             </button>
//           </form>

//           <p className="text-center text-sm text-slate-500 mt-6">
//             Don't have an account?{" "}
//             <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
//               Register
//             </Link>
//           </p>
//         </div>

//         {/* Demo credentials */}
//         <div className="mt-6 p-4 bg-white/10 backdrop-blur rounded-xl">
//           <p className="text-sm text-slate-300 text-center mb-2">Demo Accounts:</p>
//           <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
//             <p>admin@diss.com</p>
//             <p>warehouse@diss.com</p>
//             <p>pharmacist@diss.com</p>
//             <p>driver@diss.com</p>
//           </div>
//           <p className="text-xs text-slate-500 text-center mt-2">Password: password123</p>
//         </div>
//       </div>
//     </div>
//   )
// }
