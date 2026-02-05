import { IoIosNotificationsOutline } from 'react-icons/io';

export default function Notification() {
  return (
    <button className='relative flex items-center justify-center min-w-10 min-h-10 rounded-lg focus:bg-[#F5F7FA] hover:bg-gray-50'>
      <IoIosNotificationsOutline className="w-8 h-8"/>
      <div className="absolute top-[6px] right-0 w-[0.7rem] h-[0.7rem] flex items-center justify-center bg-white rounded-full p-[2px] mr-2">
        <span className="w-full h-full bg-[#56bbe3] rounded-full" />
      </div>
    </button>
  )
}