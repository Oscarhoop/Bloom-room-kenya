import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "Admin Dashboard | Bloom",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="font-cormorant text-4xl font-light text-bloom-charcoal">Dashboard</h1>
        <p className="font-inter mt-1 text-sm text-bloom-taupe">Overview of your flower shop</p>
      </div>

      <DashboardClient />
    </div>
  );
}
