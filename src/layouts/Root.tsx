import { SearchResetOnRouteChange } from '@/contexts/SearchResetOnRouteChange'
import { Outlet } from 'react-router-dom'

export default function Root() {
  return (
    <section className='h-full'>
         <SearchResetOnRouteChange />
          <Outlet/>
    </section>
  )
}
