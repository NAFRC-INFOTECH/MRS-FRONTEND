import { HeartPulse, LeafyGreen, ThermometerSun } from "lucide-react"

function RecentVitalSign() {
    return (
    <>
       {/* {person.YearlyData.year.map} */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-2 xl:gap-4 pt-3">
            <div className="bg-[#00b2cb] p-4 lg:p-2 xl:p-4 rounded-lg bg-opacity-30 dark:bg-opacity-90 shadow-sm flex flex-col justify-between gap-3">
                <div className="flex items-center justify-center w-[4rem] h-[4rem] bg-white rounded-full">
                    <LeafyGreen size={29} className="text-[#00b2cb] text-opacity-40" />
                </div>
                <div>
                    <h4 className="">Respiratory Rate</h4>
                    <p className="font-bold">{'60 breaths/min'}</p>
                </div>
                <p className="text-sm lg:text-xs xl:text-sm">Normal</p>
            </div>

            <div className="bg-[#ff5d00] p-4 lg:p-2 xl:p-4 rounded-lg bg-opacity-20 dark:bg-opacity-70 shadow-sm flex flex-col justify-between gap-3">
                <div className="flex items-center justify-center w-[4rem] h-[4rem] bg-white rounded-full">
                    <ThermometerSun size={29} className="text-[#ff5d00] text-opacity-40" />
                </div>
                <div>
                    <h4 className="">Temperature</h4>
                    <p className="font-bold">{'98.6°F'}</p>
                </div>
                <p className="text-sm lg:text-xs xl:text-sm">Normal</p>
            </div>
            <div className="bg-red-500 pl-4 lg:p-2 xl:p-4 py-4 rounded-lg bg-opacity-20 dark:bg-opacity-70 shadow-sm flex flex-col justify-between gap-3">
                <div className="flex items-center justify-center w-[4rem] h-[4rem] bg-white rounded-full">
                    <HeartPulse size={29} className="text-red-500 text-opacity-50" />
                </div>
                <div>
                    <h4 className="">Heart Rate</h4>
                    <p className="font-bold">{'72 bpm'}</p>
                </div>
                <p className="text-sm lg:text-xs xl:text-sm">Lower Than Average</p>
            </div>
        </div>
    </>
  )
}

export default RecentVitalSign