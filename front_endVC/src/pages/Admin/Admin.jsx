import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import './Admin.css'
import AdminSidebar from '../../Components/AdminSidebar/AdminSidebar'


function Admin() {
     // Favicon y título dinámicos
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']");
    if (link) link.href = "/logo_vidaconectada.png";
    document.title = "Adminitración | Vida Conectada";
  }, []);

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