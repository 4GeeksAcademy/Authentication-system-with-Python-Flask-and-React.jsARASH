import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()
	const navigate = useNavigate()

	const token = sessionStorage.getItem("token")

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}
	}

	useEffect(() => {
		loadMessage()
	}, [])

	const handleLogout = () => {
		sessionStorage.removeItem("token")
		navigate("/login")
	}

	return (
		<div className="text-center mt-5">
			<h1 className="display-4">Hello Rigo!!</h1>

			<p className="lead">
				<img src={rigoImageUrl} className="img-fluid rounded-circle mb-3" alt="Rigo Baby" />
			</p>

			{/* AUTH BUTTONS */}
			<div className="mb-4">

				{!token ? (
					<>
						<Link to="/signup" className="btn btn-primary me-2">
							Signup
						</Link>

						<Link to="/login" className="btn btn-success me-2">
							Login
						</Link>
					</>
				) : (
					<>
						<Link to="/private" className="btn btn-warning me-2">
							Private Page
						</Link>

						<button
							className="btn btn-danger"
							onClick={handleLogout}
						>
							Logout
						</button>
					</>
				)}

			</div>

			<div className="alert alert-info">
				{store.message ? (
					<span>{store.message}</span>
				) : (
					<span className="text-danger">
						Loading message from the backend (make sure your python 🐍 backend is running)...
					</span>
				)}
			</div>
		</div>
	);
};