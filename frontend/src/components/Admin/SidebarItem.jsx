const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
      active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
        : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
    }`}
  >
    <Icon size={20} />
    <span className="text-sm">{label}</span>
  </button>
);

export default SidebarItem;
