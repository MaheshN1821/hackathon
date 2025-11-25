import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { drugAPI, movementAPI } from "../services/api";
import {
	QrCode,
	Package,
	Truck,
	X,
	CheckCircle,
	Scan,
	Camera,
	ArrowRight,
	AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Scanner() {
	const [scanning, setScanning] = useState(false);
	const [scannedData, setScannedData] = useState(null);
	const [drug, setDrug] = useState(null);
	const [loading, setLoading] = useState(false);
	const [scanMode, setScanMode] = useState("drug");
	const scannerRef = useRef(null);
	const navigate = useNavigate();

	useEffect(() => {
		return () => {
			if (scannerRef.current) {
				scannerRef.current.clear();
			}
		};
	}, []);

	const startScanner = () => {
		setScanning(true);
		setScannedData(null);
		setDrug(null);

		setTimeout(() => {
			const scanner = new Html5QrcodeScanner("qr-reader", {
				fps: 10,
				qrbox: { width: 250, height: 250 },
			});

			scanner.render(onScanSuccess, onScanError);
			scannerRef.current = scanner;
		}, 100);
	};

	const stopScanner = () => {
		if (scannerRef.current) {
			scannerRef.current.clear();
			scannerRef.current = null;
		}
		setScanning(false);
	};

	const onScanSuccess = async (decodedText) => {
		stopScanner();

		try {
			const data = JSON.parse(decodedText);
			setScannedData(data);

			if (data.drugId) {
				setLoading(true);
				const response = await drugAPI.scanQR({
					drugId: data.drugId,
					batchNo: data.batchNo,
				});
				setDrug(response.data.drug);
				toast.success("Drug found!");
			}
		} catch (error) {
			toast.error("Invalid QR code or drug not found");
			setScannedData({ raw: decodedText, error: true });
		} finally {
			setLoading(false);
		}
	};

	const onScanError = (error) => {
		// Ignore scan errors
	};

	const handleUpdateMovement = async (movementId, location) => {
		try {
			await movementAPI.scan(movementId, {
				location,
				notes: "Scanned via QR code",
			});
			toast.success("Movement updated successfully");
		} catch (error) {
			toast.error("Failed to update movement");
		}
	};

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">QR Scanner</h1>
					<p className="text-slate-500">
						Scan drug QR codes to verify and track inventory
					</p>
				</div>

				{/* Scan Mode Toggle */}
				<div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
					<button
						onClick={() => setScanMode("drug")}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
							scanMode === "drug"
								? "bg-white text-teal-600 shadow-sm"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<Package className="w-4 h-4" />
						Drug
					</button>
					<button
						onClick={() => setScanMode("movement")}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
							scanMode === "movement"
								? "bg-white text-teal-600 shadow-sm"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<Truck className="w-4 h-4" />
						Movement
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Scanner Panel */}
				<div className="card-elevated">
					<div className="flex items-center gap-3 mb-6">
						<div className="icon-box icon-box-lg bg-gradient-to-br from-teal-500 to-cyan-500">
							<Scan className="w-6 h-6 text-white" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-slate-900">Scanner</h2>
							<p className="text-sm text-slate-500">
								{scanMode === "drug"
									? "Scan drug QR codes"
									: "Scan movement QR codes"}
							</p>
						</div>
					</div>

					{!scanning ? (
						<div className="text-center py-12">
							<div className="relative inline-block mb-6">
								<div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
									<QrCode className="w-16 h-16 text-slate-400" />
								</div>
								{/* Scanning Animation Overlay */}
								<div className="absolute inset-0 rounded-3xl border-2 border-dashed border-teal-300 animate-pulse"></div>
							</div>
							<p className="text-slate-500 mb-6">
								Position QR code within the scanner frame
							</p>
							<button onClick={startScanner} className="btn-primary">
								<Camera className="w-4 h-4" />
								Start Scanner
							</button>
						</div>
					) : (
						<div className="space-y-4">
							<div className="relative rounded-2xl overflow-hidden bg-slate-900">
								{/* Scanner Overlay */}
								<div className="absolute inset-0 z-10 pointer-events-none">
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-64 h-64 relative">
											{/* Corner Brackets */}
											<div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-lg"></div>
											<div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-lg"></div>
											<div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-lg"></div>
											<div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-lg"></div>
											{/* Scanning Line */}
											<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan"></div>
										</div>
									</div>
								</div>
								<div id="qr-reader" className="w-full" />
							</div>
							<button onClick={stopScanner} className="btn-secondary w-full">
								<X className="w-4 h-4" />
								Stop Scanner
							</button>
						</div>
					)}
				</div>

				{/* Results Panel */}
				<div className="card-elevated">
					<div className="flex items-center gap-3 mb-6">
						<div className="icon-box icon-box-lg bg-gradient-to-br from-emerald-500 to-teal-500">
							<CheckCircle className="w-6 h-6 text-white" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-slate-900">
								Scan Result
							</h2>
							<p className="text-sm text-slate-500">Verification details</p>
						</div>
					</div>

					{loading ? (
						<div className="flex flex-col items-center justify-center py-16">
							<div className="relative">
								<div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
								<div className="absolute inset-0 w-16 h-16 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
							</div>
							<p className="text-slate-500 mt-4">Verifying drug...</p>
						</div>
					) : drug ? (
						<div className="space-y-4 animate-scale-in">
							{/* Success Banner */}
							<div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
								<div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
									<CheckCircle className="w-5 h-5 text-emerald-600" />
								</div>
								<div>
									<span className="font-semibold text-emerald-700">
										Drug Verified
									</span>
									<p className="text-sm text-emerald-600">
										Authentic product confirmed
									</p>
								</div>
							</div>

							{/* Drug Info */}
							<div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
								<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
									<Package className="w-7 h-7 text-white" />
								</div>
								<div>
									<h3 className="font-semibold text-slate-900">{drug.name}</h3>
									<p className="text-sm text-slate-500">{drug.drugId}</p>
								</div>
							</div>

							{/* Drug Details Grid */}
							<div className="grid grid-cols-2 gap-3">
								{[
									{ label: "Batch", value: drug.batchNo },
									{ label: "Quantity", value: `${drug.quantity} ${drug.unit}` },
									{
										label: "Location",
										value: drug.location?.replace("-", " "),
									},
									{
										label: "Status",
										value: drug.stockStatus?.replace("-", " "),
									},
								].map((item, index) => (
									<div key={index} className="p-3 bg-slate-50 rounded-xl">
										<p className="text-xs text-slate-500 mb-1">{item.label}</p>
										<p className="font-medium text-slate-900 capitalize">
											{item.value}
										</p>
									</div>
								))}
							</div>

							{/* Actions */}
							<div className="flex gap-3 pt-2">
								<button
									onClick={() => navigate(`/inventory/${drug._id}`)}
									className="btn-primary flex-1"
								>
									View Details
									<ArrowRight className="w-4 h-4" />
								</button>
								<button
									onClick={() => {
										setDrug(null);
										setScannedData(null);
										startScanner();
									}}
									className="btn-secondary"
								>
									<Scan className="w-4 h-4" />
									Scan Again
								</button>
							</div>
						</div>
					) : scannedData?.error ? (
						<div className="text-center py-12 animate-fade-in">
							<div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
								<AlertCircle className="w-10 h-10 text-red-500" />
							</div>
							<h3 className="font-semibold text-slate-900 mb-2">
								Invalid QR Code
							</h3>
							<p className="text-slate-500 mb-6">
								The scanned code is not recognized or the drug was not found
							</p>
							<button
								onClick={() => {
									setScannedData(null);
									startScanner();
								}}
								className="btn-secondary"
							>
								<Scan className="w-4 h-4" />
								Try Again
							</button>
						</div>
					) : (
						<div className="text-center py-16">
							<div className="relative inline-block mb-6">
								<div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center">
									<QrCode className="w-12 h-12 text-slate-300" />
								</div>
							</div>
							<h3 className="font-semibold text-slate-900 mb-2">
								No Scan Results
							</h3>
							<p className="text-slate-500">
								Scan a QR code to see verification results
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Quick Tips */}
			<div className="card-elevated">
				<h3 className="font-semibold text-slate-900 mb-4">Quick Tips</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{[
						{
							title: "Good Lighting",
							desc: "Ensure adequate lighting for best scan results",
						},
						{
							title: "Steady Position",
							desc: "Hold the QR code steady within the frame",
						},
						{
							title: "Clean Surface",
							desc: "Make sure the QR code is clean and undamaged",
						},
					].map((tip, index) => (
						<div
							key={index}
							className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl"
						>
							<div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
								<span className="text-sm font-bold text-teal-600">
									{index + 1}
								</span>
							</div>
							<div>
								<p className="font-medium text-slate-900">{tip.title}</p>
								<p className="text-sm text-slate-500">{tip.desc}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// above correct

// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useNavigate } from "react-router-dom"
// import { Html5QrcodeScanner } from "html5-qrcode"
// import { drugAPI, movementAPI } from "../services/api"
// import { QrCode, Package, Truck, X, CheckCircle } from "lucide-react"
// import toast from "react-hot-toast"

// export default function Scanner() {
//   const [scanning, setScanning] = useState(false)
//   const [scannedData, setScannedData] = useState(null)
//   const [drug, setDrug] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [scanMode, setScanMode] = useState("drug") // 'drug' or 'movement'
//   const scannerRef = useRef(null)
//   const navigate = useNavigate()

//   useEffect(() => {
//     return () => {
//       if (scannerRef.current) {
//         scannerRef.current.clear()
//       }
//     }
//   }, [])

//   const startScanner = () => {
//     setScanning(true)
//     setScannedData(null)
//     setDrug(null)

//     setTimeout(() => {
//       const scanner = new Html5QrcodeScanner("qr-reader", {
//         fps: 10,
//         qrbox: { width: 250, height: 250 },
//       })

//       scanner.render(onScanSuccess, onScanError)
//       scannerRef.current = scanner
//     }, 100)
//   }

//   const stopScanner = () => {
//     if (scannerRef.current) {
//       scannerRef.current.clear()
//       scannerRef.current = null
//     }
//     setScanning(false)
//   }

//   const onScanSuccess = async (decodedText) => {
//     stopScanner()

//     try {
//       const data = JSON.parse(decodedText)
//       setScannedData(data)

//       if (data.drugId) {
//         setLoading(true)
//         const response = await drugAPI.scanQR({ drugId: data.drugId, batchNo: data.batchNo })
//         setDrug(response.data.drug)
//         toast.success("Drug found!")
//       }
//     } catch (error) {
//       toast.error("Invalid QR code or drug not found")
//       setScannedData({ raw: decodedText, error: true })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const onScanError = (error) => {
//     // Ignore scan errors (they happen frequently during scanning)
//   }

//   const handleUpdateMovement = async (movementId, location) => {
//     try {
//       await movementAPI.scan(movementId, {
//         location,
//         notes: "Scanned via QR code",
//       })
//       toast.success("Movement updated successfully")
//     } catch (error) {
//       toast.error("Failed to update movement")
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl font-bold text-slate-900">QR Scanner</h1>
//         <p className="text-slate-500">Scan drug QR codes to view details or update movements</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Scanner */}
//         <div className="card">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-slate-900">Scanner</h2>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setScanMode("drug")}
//                 className={`btn btn-sm ${scanMode === "drug" ? "btn-primary" : "btn-secondary"}`}
//               >
//                 <Package className="w-4 h-4" />
//                 Drug
//               </button>
//               <button
//                 onClick={() => setScanMode("movement")}
//                 className={`btn btn-sm ${scanMode === "movement" ? "btn-primary" : "btn-secondary"}`}
//               >
//                 <Truck className="w-4 h-4" />
//                 Movement
//               </button>
//             </div>
//           </div>

//           {!scanning ? (
//             <div className="text-center py-12">
//               <QrCode className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//               <p className="text-slate-500 mb-4">Click the button below to start scanning</p>
//               <button onClick={startScanner} className="btn btn-primary">
//                 <QrCode className="w-4 h-4" />
//                 Start Scanner
//               </button>
//             </div>
//           ) : (
//             <div>
//               <div id="qr-reader" className="w-full" />
//               <button onClick={stopScanner} className="btn btn-secondary w-full mt-4">
//                 <X className="w-4 h-4" />
//                 Stop Scanner
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Results */}
//         <div className="card">
//           <h2 className="text-lg font-semibold text-slate-900 mb-4">Scan Result</h2>

//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
//             </div>
//           ) : drug ? (
//             <div className="space-y-4">
//               <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
//                 <CheckCircle className="w-6 h-6 text-emerald-500" />
//                 <span className="font-medium text-emerald-700">Drug verified successfully</span>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-primary-100 rounded-lg">
//                   <Package className="w-6 h-6 text-primary-600" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-slate-900">{drug.name}</h3>
//                   <p className="text-sm text-slate-500">{drug.drugId}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-slate-500">Batch</p>
//                   <p className="font-medium text-slate-900">{drug.batchNo}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-slate-500">Quantity</p>
//                   <p className="font-medium text-slate-900">
//                     {drug.quantity} {drug.unit}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-slate-500">Location</p>
//                   <p className="font-medium text-slate-900 capitalize">{drug.location.replace("-", " ")}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-slate-500">Status</p>
//                   <p className="font-medium text-slate-900 capitalize">{drug.stockStatus.replace("-", " ")}</p>
//                 </div>
//               </div>

//               <div className="flex gap-2 pt-4">
//                 <button onClick={() => navigate(`/inventory/${drug._id}`)} className="btn btn-primary flex-1">
//                   View Details
//                 </button>
//                 <button
//                   onClick={() => {
//                     setDrug(null)
//                     setScannedData(null)
//                     startScanner()
//                   }}
//                   className="btn btn-secondary"
//                 >
//                   Scan Again
//                 </button>
//               </div>
//             </div>
//           ) : scannedData?.error ? (
//             <div className="text-center py-8">
//               <X className="w-12 h-12 text-red-300 mx-auto mb-4" />
//               <p className="text-slate-500">Invalid QR code or drug not found</p>
//               <button
//                 onClick={() => {
//                   setScannedData(null)
//                   startScanner()
//                 }}
//                 className="btn btn-secondary mt-4"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-4" />
//               <p className="text-slate-500">Scan a QR code to see results</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
