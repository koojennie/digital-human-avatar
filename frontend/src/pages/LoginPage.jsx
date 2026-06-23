import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { authServices } from "../services/auth.services.js";
import { AlertCircle, Loader2 } from "lucide-react";

export const LoginPage = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authServices.loginAdmin(username, password);

      navigate("/admin");
    } catch (error) {
      setError(error.message || "Terjadi kesalahan saat login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        id="login-view"
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4"
        style={{ backgroundImage: "url('/bg-admin.jpg')" }}
      >
        <div className="max-w-md w-full glass-panel p-10 rounded-[2.5rem] shadow-lg bg-white">
          <div className="text-center mb-8">
            <img src="/logo.png" width={64} className="items-center mx-auto mb-4"/>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Selamat Datang Kembali, Admin
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Silakan masuk menggunakan kredensial moodle Anda
            </p>
          </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-700 animate-in fade-in zoom-in-95">
            <AlertCircle className="shrink-0 text-rose-500" size={24} />
            <div className="text-sm font-bold leading-relaxed">Username atau password salah</div>
          </div>
        )}
          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">
              Username
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-slate-100/70 border-none rounded-2xl focus:ring-2 focus:ring-pink-600 focus:bg-white transition-all outline-none text-sm font-bold text-slate-800 disabled:opacity-60"
              placeholder="Masukkan username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">
              Password
            </label>
            <input
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-100/70 border-none rounded-2xl focus:ring-2 focus:ring-pink-600 focus:bg-white transition-all outline-none text-sm font-bold text-slate-800 disabled:opacity-60"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 cursor-pointer bg-pink-600 text-white font-extrabold rounded-2xl hover:bg-pink-700 transition-all ease-in duration-300 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Memverifikasi Akses...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>
          {/* <div className="mt-8 text-center">
            <a
              href="#"
              className="text-sm font-semibold text-slate-400 hover:text-blue-600 transition-colors"
            >
              Lupa akses admin?
            </a>
          </div> */}
        </div>
      </div>
    </>
  );
};