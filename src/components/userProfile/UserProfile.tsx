import { EllipsisVertical, Settings } from "lucide-react";
import { useUser } from "@/api-integration/redux/selectors";
import { useProfileQuery } from "@/api-integration/queries/profile";
import { Link } from "react-router-dom";

export default function UserProfile({className, textSize}: {className?: string, textSize?: string}) {
  const user = useUser();
  const { data } = useProfileQuery();
  const displayName = data?.name || user?.name || "User";
  const roles = user?.roles || [];
  const roleLabel =
    roles.includes("super_admin")
      ? "Super Admin"
      : roles.includes("doctor")
      ? "Doctor"
      : roles.includes("nurse")
      ? "Nurse"
      : roles.includes("recording")
      ? "Recording"
      : " ";
  const avatar = data?.imageUrl || user?.imageUrl || "https://plus.unsplash.com/premium_vector-1682269287900-d96e9a6c188b?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  return (
      <section className={`${className} items-center justify-between w-full max-h-[5rem] dark:border-gray-600 pr-1`}>
        <div className="w-auto h-auto flex items-center justify-center bg-white dark:bg-transparent rounded-full shadow-lg border-2 border-[#56bbe3] p-1">
            <div className="user-image-container w-[2.3rem] h-[2.3rem] flex items-center justify-center bg-white rounded-full overflow-hidden">
                <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            </div>
        </div>
          <div className={`text-left flex flex-col ${textSize || 'text-xs md:text-sm'} text-gray-600 dark:text-[#56bbe3] ml-1`}>
            <b className="">{displayName}</b>
            <p className="dark:text-gray-400">{roleLabel}</p>
        </div>
        <span className="w-[0.2rem] h-[2.1rem] bg-gray-100 dark:bg-gray-600 rounded-full text-gray-100 dark:text-gray-600 mx-1">.</span>
        <Link to="/settings" className="flex items-center dark:text-[#56bbe3] text-gray-600 hover:text-gray-800 dark:hover:text-gray-400 transition-all duration-300 ease-in-out">
            <Settings />
            <EllipsisVertical />
        </Link>  
    </section>
  )
}
