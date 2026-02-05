import DashCards from "./components/dashboard/DashCards";

export default function AdminMain() {
  return (
    <section>
      <div> 
        <h1 className="text-[clamp(1.1rem,3vw,2.1rem)]">
          Dashboard Overview
        </h1> 
        <p className="text-[clamp(0.9rem,3vw,1.2rem)] text-gray-500">Welcome back Admin, here is an overview of your dashboard.</p>
      </div>
      <DashCards/>
    </section>
  )
}
