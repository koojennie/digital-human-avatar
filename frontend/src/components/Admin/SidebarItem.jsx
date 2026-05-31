const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ease-in font-medium cursor-pointer ${
      active
        ? "bg-pink-400 text-white"
        : "text-slate-500 hover:bg-slate-50 hover:text-pink-600"
    }`}
  >
    <Icon size={20} />
    <span className="text-sm">{label}</span>
  </button>
);

export default SidebarItem;
