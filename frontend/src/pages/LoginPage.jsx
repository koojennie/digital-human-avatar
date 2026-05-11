import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard"); 
  };

  return (
    <>
      <div
        id="login-view"
        className="min-h-screen flex items-center justify-center gradient-bg px-4"
      >
        <div className="max-w-md w-full glass-panel p-10 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Admin<span className="text-blue-600">Control</span>
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Maintenance &amp; RAG AI Management
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email Admin
              </label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                placeholder="admin@moodlepro.ac.id"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
            >
              Masuk ke Dashboard
            </button>
          </form>
          <div className="mt-8 text-center">
            <a
              href="#"
              className="text-sm font-semibold text-slate-400 hover:text-blue-600 transition-colors"
            >
              Lupa akses admin?
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
