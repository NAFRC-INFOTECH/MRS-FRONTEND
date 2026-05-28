import WardPatientsTable from "./components/WardPatientsTable";

export default function ChildrenWard() {
  return (
    <div className="py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Children Ward</h1>
      <WardPatientsTable wardUnit="ChildrenWard" />
    </div>
  );
}
