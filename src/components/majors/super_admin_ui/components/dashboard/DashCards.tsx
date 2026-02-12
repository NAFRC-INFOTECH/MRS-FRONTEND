// import React from 'react'

export default function DashCards() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      <div className="border border-gray-300 rounded-lg px-3 py-2 space-y-4 flex flex-col justify-between h-[5.7rem] md:min-h-[6.5rem]">
          <h2 className="text-[clamp(1rem,3vw,1.2rem)] border-b border-gray-300 font-semibold">
            Total Users
          </h2>
          <p className="text-[clamp(1rem,3vw,1.1rem)] text-gray-500">
            1234
          </p>
      </div>
      <div className="border border-gray-300 rounded-lg px-3 py-2 space-y-4 flex flex-col justify-between h-[5.7rem] md:min-h-[6.5rem]">
          <h2 className="text-[clamp(1rem,3vw,1.1rem)] border-b border-gray-300 font-semibold">
            Total Buses
          </h2>
          <p className="text-[clamp(1rem,3vw,1.1rem)] text-gray-500">
            1234
          </p>
      </div>
      <div className="border border-gray-300 rounded-lg px-3 py-2 space-y-4 flex flex-col justify-between h-[5.7rem] md:min-h-[6.5rem]">
          <h2 className="text-[clamp(1rem,3vw,1.1rem)] border-b border-gray-300 font-semibold">
            Total Doctors
          </h2>
          <p className="text-[clamp(1rem,3vw,1.1rem)] text-gray-500">
            1234
          </p>
      </div>
      <div className="border border-gray-300 rounded-lg px-3 py-2 space-y-4 flex flex-col justify-between h-[5.7rem] md:min-h-[6.5rem]">
          <h2 className="text-[clamp(1rem,3vw,1.1rem)] border-b border-gray-300 font-semibold">
            Total Nurses
          </h2>
          <p className="text-[clamp(1rem,3vw,1.1rem)] text-gray-500">
            1234
          </p>
      </div>
      <div className="border border-gray-300 rounded-lg px-3 py-2 space-y-4 flex flex-col justify-between h-[5.7rem] md:min-h-[6.5rem]">
          <h2 className="text-[clamp(1rem,3vw,1.1rem)] border-b border-gray-300 font-semibold">
            Total Beds
          </h2>
          <p className="text-[clamp(1rem,3vw,1.1rem)] text-gray-500">
            1234
          </p>
      </div>

    </section>
  )
}
