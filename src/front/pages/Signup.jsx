import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Signup = () => {
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/signup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					email,
					password
				})
			});

			const data = await resp.json();

			if (!resp.ok) {
				setError(data.msg || "Signup failed");
				return;
			}

			navigate("/login");
		} catch (err) {
			setError("Server error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mt-5" style={{ maxWidth: "500px" }}>
			<h2 className="mb-4">Signup</h2>

			{error && <div className="alert alert-danger">{error}</div>}

			<form onSubmit={handleSubmit}>
				<div className="mb-3">
					<label className="form-label">Email</label>
					<input
						type="email"
						className="form-control"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>

				<div className="mb-3">
					<label className="form-label">Password</label>
					<input
						type="password"
						className="form-control"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<button type="submit" className="btn btn-primary w-100" disabled={loading}>
					{loading ? "Creating..." : "Signup"}
				</button>
			</form>

			<p className="mt-3 text-center">
				Already have an account? <Link to="/login">Login</Link>
			</p>
		</div>
	);
};