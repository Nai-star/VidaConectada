import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import Home from '../Pages/Home/Home'


import Private_routing from "./PrivateRouting";
import GaleriaVermas from '../Components/Galeria/GaleriaVermas';
import Login from '../pages/Login/Login';
import Register from '../Components/Register/Register';
import Admin from '../pages/Admin/Admin';
import Configuracion from '../Components/AdminSidebar/Configuraciones/Configuracion';
import Dashboard from '../Components/AdminSidebar/Dashboard/Dashboard';
import GestionUsuarios from '../Components/AdminSidebar/GestionUsuarios/GestionUsuarios';
import CaruselAdmin from '../Components/CaruselAdmin/CaruselAdmin';
import Requisitos from '../Components/RequisitosAdmin/Requsitos/Requisitos';
import AdminGaleria from '../Components/AdminSidebar/AdminGaleria/AdminGaleria';
import RedBancos from "../Components/AdminSidebar/RedBancos/RedBancos";
import AdminBuzon from '../Components/AdminSidebar/AdminBuzon/AdminBuzon';
import TipoSangre from "../Components/AdminSidebar/TipoSangre/TipoSangre"
import CampanasAdmin from "../Components/AdminSidebar/CampanasAdmin/CampanasAdmin"
import GuiaDonante from '../Components/GuiaDonanate/GuiaDonante';
import TestimoniosAdmin from '../Components/AdminSidebar/TestimonioAdmin/TestimonioAdmin';
import TerminosUso from "../Components/Terminos/TerminosUso"

import PrivateRouting from './PrivateRouting';


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
        <Route path='/guia-donante' element={<GuiaDonante/>}/>
            <Route path='/terminos' element={<TerminosUso/>}/>
         <Route path='/testimonio' element={<TestimoniosAdmin/>}/>
        
        {/* <Route path='/admin' element={<Admin/>}/> */}


       
      

        {/* Rutas anidadas del panel de administración */}
        <Route element={<PrivateRouting />}>
        <Route path="/admin" element={
             
                <Admin />
              
          }>

          <Route index element={<Dashboard/>}/>
          <Route path='configuracion' element={<Configuracion/>}/>
          <Route path='gestion_usuarios' element={<GestionUsuarios/>} />    
          <Route path='carusel_admin' element={<CaruselAdmin/>} />       
          <Route path='requisitos_admin' element={<Requisitos/>} /> 
          <Route path='admin_buzon' element={<AdminBuzon/>} />  
          <Route path='red_bancos' element={<RedBancos/>} />  
          <Route path='TS' element={<TipoSangre/>} />  
          <Route path='CampanaAdmin' element={<CampanasAdmin/>} />  
          <Route path='register' element={<Register/>}/>
          <Route path='galeria_admin' element={<AdminGaleria/>}/>
        </Route>
        </Route>

         




       

        
      </Routes>    
    </Router>
  )
}

export default Routing
