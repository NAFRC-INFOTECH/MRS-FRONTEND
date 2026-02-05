import { Outlet } from 'react-router-dom'

export default function Root() {
  return (
      <section className='h-full'>
          <Outlet/>
    </section>
  )
}
