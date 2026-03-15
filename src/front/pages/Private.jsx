import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Private = () => {
	const navigate = useNavigate();
	const [message, setMessage] = useState("");
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = sessionStorage.getItem("token");

		if (!token) {
			navigate("/login");
			return;
		}

		const validateUser = async () => {
			try {
				const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/private`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const data = await resp.json();

				if (!resp.ok) {
					sessionStorage.removeItem("token");
					navigate("/login");
					return;
				}

				setMessage(data.msg);
				setUser(data.user);
			} catch (err) {
				sessionStorage.removeItem("token");
				navigate("/login");
			} finally {
				setLoading(false);
			}
		};

		validateUser();
	}, [navigate]);

	if (loading) {
		return (
			<div className="container mt-5">
				<h4>Loading...</h4>
			</div>
		);
	}

	return (
		<div className="container mt-5">
			<h2>Private Dashboard</h2>
			<p>{message}</p>

			{user && (
				<div className="card p-3 mt-3">
					<h5>User Info</h5>
					<p><strong>ID:</strong> {user.id}</p>
					<p><strong>Email:</strong> {user.email}</p>
				</div>
			)}
		</div>
	);
};