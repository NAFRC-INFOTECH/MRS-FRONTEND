import WardPatientsTable from "./components/WardPatientsTable";

export default function MaleWard() {
  return (
    <div className="py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Male Ward</h1>
      <WardPatientsTable wardUnit="MaleWard" />
    </div>
  );
}
