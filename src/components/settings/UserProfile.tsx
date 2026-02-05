import { EllipsisVertical, Settings } from "lucide-react";

export default function UserProfile({className, textSize}: {className?: string, textSize?: string}) {
  return (
      <section className={`${className} items-center justify-between w-full max-h-[5rem] dark:border-gray-600 pr-1`}>
        <div className="w-auto h-auto flex items-center justify-center bg-white dark:bg-transparent rounded-full shadow-lg border-2 border-[#56bbe3] p-1">
            <div className="user-image-container w-[2.3rem] h-[2.3rem] flex items-center justify-center bg-white rounded-full overflow-hidden">
                <img 
                src="https://images.unsplash.com/photo-1651008376811-b90baee60c1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2NzIxNjl8MHwxfHNlYXJjaHwxfHxkb2N0b3J8ZW58MHx8fHwxNzM3NDQxMDUzfDA&ixlib=rb-4.0.3&q=80&w=1080" alt="logo" 
                className="w-full h-full object-cover"
                />
            </div>
        </div>
          <div className={`text-left flex flex-col ${textSize || 'text-xs md:text-sm'} text-gray-600 dark:text-[#56bbe3] ml-1`}>
            <b className="">Victor Movicx</b>
            <p className="dark:text-gray-400">General Practitioner</p>
        </div>
        <span className="w-[0.2rem] h-[2.1rem] bg-gray-100 dark:bg-gray-600 rounded-full text-gray-100 dark:text-gray-600 mx-1">.</span>
        <section className="flex items-center dark:text-[#56bbe3] text-gray-600 hover:text-gray-800 dark:hover:text-gray-400 transition-all duration-300 ease-in-out">
            <Settings />
            <EllipsisVertical />
        </section>  
    </section>
  )
}
