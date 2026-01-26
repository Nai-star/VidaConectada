import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import Home from '../Pages/Home/Home'


import Private_routing from "./PrivateRouting";
import GaleriaVermas from '../Components/Pagehome/Galeria/GaleriaVermas';
import Login from '../pages/Login/Login';
import Register from '../Components/Admin/Register/Register';
import Admin from '../pages/Admin/Admin';
import Configuracion from '../Components/Admin/Configuraciones/Configuracion';
import Dashboard from '../Components/Admin/Dashboard/Dashboard';
import GestionUsuarios from '../Components/Admin/GestionUsuarios/GestionUsuarios';
import CaruselAdmin from '../Components/Admin/CaruselAdmin/CaruselAdmin';
import Requisitos from '../Components/Admin/RequisitosAdmin/Requsitos/Requisitos';
import AdminGaleria from '../Components/Admin/AdminGaleria/AdminGaleria';
import RedBancos from "../Components/Admin/RedBancos/RedBancos";
import AdminBuzon from '../Components/Admin/AdminBuzon/AdminBuzon';
import TipoSangre from "../Components/Admin/TipoSangre/TipoSangre"
import CampanasAdmin from "../Components/Admin/CampanasAdmin/CampanasAdmin"
import GuiaDonante from '../Components/Pagehome/GuiaDonanate/GuiaDonante';
import TestimoniosAdmin from '../Components/Admin/TestimonioAdmin/TestimonioAdmin';
import TerminosUso from "../Components/Terminos/TerminosUso"
import PoliticasP from '../Components/politicas/PoliticasP';

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
        <Route path='/privacidad' element={<PoliticasP/>}/>
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
          <Route path='testimonio_admin' element={<TestimoniosAdmin/>}/>
        </Route>
        </Route>

         




       

        
      </Routes>    
    </Router>
  )
}

export default Routing
