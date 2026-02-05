// import React from 'react'

export default function DashCards() {
  return (
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          <div className="border border-gray-300 rounded-lg p-4 space-y-4">
              <h2 className="text-[clamp(1.1rem,3vw,1.5rem)]">
                Total Users
              </h2>
              <p className="text-[clamp(1rem,3vw,1.3rem)] text-gray-500">
                1234
              </p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 space-y-4">
              <h2 className="text-[clamp(1.1rem,3vw,1.5rem)]">
                Total Courses
              </h2>
              <p className="text-[clamp(1rem,3vw,1.3rem)] text-gray-500">
                1234
              </p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 space-y-4">
              <h2 className="text-[clamp(1.1rem,3vw,1.5rem)]">
                Total Enrollments
              </h2>
              <p className="text-[clamp(1rem,3vw,1.3rem)] text-gray-500">
                1234
              </p>
          </div>
    </section>
  )
}
