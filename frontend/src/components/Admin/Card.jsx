export const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h3 className="text-3xl font-extrabold mt-1 tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Badge = ({ status }) => {
  const styles = {
    indexed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    processing: "bg-blue-50 text-blue-700 border-blue-100 animate-pulse",
    failed: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.indexed}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
