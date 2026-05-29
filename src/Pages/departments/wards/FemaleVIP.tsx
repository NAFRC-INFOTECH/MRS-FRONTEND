import WardPatientsTable from "./components/WardPatientsTable";

export default function FemaleVIP() {
  return (
    <div className="py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Female VIP Ward</h1>
      <WardPatientsTable wardUnit="FemaleVIP" />
    </div>
  );
}
