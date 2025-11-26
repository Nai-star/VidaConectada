import React from 'react'
import { Outlet } from 'react-router-dom'
import './Admin.css'
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar'

function Admin() {
  return (
  

      <div className='body-Admin'>
      <AdminSidebar/>
      <div /* style={{ marginLeft: '240px', padding: '20px' }} */>
        <Outlet />
      </div>

    </div>



  )
}

export default Admin