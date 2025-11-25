import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import { socketService } from "./services/socket";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import DrugDetails from "./pages/DrugDetails";
import AddDrug from "./pages/AddDrug";
import Movements from "./pages/Movements";
import MovementDetails from "./pages/MovementDetails";
import CreateMovement from "./pages/CreateMovement";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Scanner from "./pages/Scanner";
import Settings from "./pages/Settings";

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
	const { user, token } = useAuthStore();

	if (!token) {
		return <Navigate to="/login" replace />;
	}

	if (roles && !roles.includes(user?.role)) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
};

function App() {
	const { user, token } = useAuthStore();

	useEffect(() => {
		if (token && user) {
			socketService.connect();
			socketService.joinUserRoom(user.id);
			socketService.joinRoleRoom(user.role);
		}

		return () => {
			socketService.disconnect();
		};
	}, [token, user]);

	return (
		<Routes>
			{/* Public Routes */}
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />

			{/* Protected Routes */}
			<Route
				path="/"
				element={
					<ProtectedRoute>
						<DashboardLayout />
					</ProtectedRoute>
				}
			>
				<Route index element={<Navigate to="/dashboard" replace />} />
				<Route path="dashboard" element={<Dashboard />} />
				<Route path="inventory" element={<Inventory />} />
				<Route path="inventory/:id" element={<DrugDetails />} />
				<Route
					path="inventory/add"
					element={
						<ProtectedRoute roles={["admin", "warehouse"]}>
							<AddDrug />
						</ProtectedRoute>
					}
				/>
				<Route path="movements" element={<Movements />} />
				<Route path="movements/:id" element={<MovementDetails />} />
				<Route
					path="movements/create"
					element={
						<ProtectedRoute roles={["admin", "warehouse"]}>
							<CreateMovement />
						</ProtectedRoute>
					}
				/>
				<Route path="alerts" element={<Alerts />} />
				<Route path="reports" element={<Reports />} />
				<Route path="scanner" element={<Scanner />} />
				<Route path="settings" element={<Settings />} />
			</Route>

			{/* Catch all */}
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
}

export default App;
