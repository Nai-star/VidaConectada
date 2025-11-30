import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import Home from '../Pages/Home/Home'


import Private_routing from "./Private_routing";
import GaleriaVermas from '../Components/Galeria/GaleriaVermas';
import Login from '../pages/Login/Login';
import Register from '../Components/Register/Register';
import Admin from '../pages/Admin/Admin';
import Configuracion from '../Components/AdminSidebar/Configuraciones/Configuracion';
import Dashboard from '../Components/AdminSidebar/Dashboard/Dashboard';
import GestionUsuarios from '../Components/AdminSidebar/GestionUsuarios/GestionUsuarios';
import CaruselAdmin from '../Components/CaruselAdmin/CaruselAdmin';
/* import AdminSidebar from '../Components/AdminSidebar/AdminSidebar'; */


function Routing() {

    //const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado") || "null"); // Obtener el usuario logueado del localStorage


  return (
    <Router>    
      <Routes>    
        {/* Rutas públicas */}
        <Route path='/' element={<Home/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/galeriavermas' element={<GaleriaVermas/>}/>

        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        {/* <Route path='/admin' element={<Admin/>}/> */}


       
      

        {/* Rutas anidadas del panel de administración */}
        <Route path="/admin" element={
           
              <Admin />
            
          }
        >
          {/* <Route path='/admin' element={<Admin/>}> */}
          {/* 👇 Todo esto aparecerá dentro del <Outlet /> de Admin */}

          <Route index element={<Dashboard/>}/>
          <Route path='configuracion' element={<Configuracion/>}/>
          <Route path='gestion_usuarios' element={<GestionUsuarios/>} />    
          <Route path='carusel_admin' element={<CaruselAdmin/>} />       
         {/*  <Route path='productos' element={<ProductosAdmin/>} />  */} {/* /admin/productos */}
          
   
        </Route>

         




       

        
      </Routes>    
    </Router>
  )
}

export default Routing
