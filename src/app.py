import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

from api.models import db, User
from api.utils import APIException, generate_sitemap
from api.admin import setup_admin
from api.commands import setup_commands


app = Flask(__name__)
app.url_map.strict_slashes = False

# Database config
db_url = os.getenv("DATABASE_URL")
if db_url:
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url.replace("postgres://", "postgresql://")
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:////tmp/test.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# JWT config
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key-change-this")

# Extensions
db.init_app(app)
Migrate(app, db, compare_type=True)
JWTManager(app)
CORS(app)

setup_admin(app)
setup_commands(app)

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Home / health
@app.route("/", methods=["GET"])
def sitemap():
    return generate_sitemap(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"msg": "API running"}), 200

# Template hello route
@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify({"message": "Hello from backend"}), 200

# AUTH ENDPOINTS

# Signup
@app.route("/api/signup", methods=["POST"])
def signup():
    body = request.get_json(silent=True) or {}

    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"msg": "User already exists"}), 409

    new_user = User(email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "msg": "User created successfully"
    }), 201

# Login
@app.route("/api/login", methods=["POST"])
def login():
    body = request.get_json(silent=True) or {}

    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "user": user.serialize()
    }), 200

# Private route
@app.route("/api/private", methods=["GET"])
@jwt_required()
def private():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))

    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "msg": "Access granted",
        "user": user.serialize()
    }), 200


if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=PORT, debug=True)