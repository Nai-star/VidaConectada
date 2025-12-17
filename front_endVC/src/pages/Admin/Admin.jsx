import React from 'react'
import { Outlet } from 'react-router-dom'
import './Admin.css'
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar'


function Admin() {
  return (
  

      <div className='body-Admin'>
      
      <AdminSidebar className="admin-sidebar"/>
   
      <div className="content-admin">
        <Outlet />
      </div>

    </div>



  )
}

export default Admin