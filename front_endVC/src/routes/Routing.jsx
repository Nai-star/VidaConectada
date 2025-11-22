import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import Home from '../Pages/Home/Home'


import Private_routing from "./Private_routing";
import GaleriaVermas from '../Components/Galeria/GaleriaVermas';
import Login from '../pages/Login/Login';
import Register from '../Components/Register/Register';


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
      
        




        {/* Rutas anidadas del panel de administración */}
        {/* <Route path="/admin" element={
            <Private_route>
              <Admin />
            </Private_route>
          }
        > */}
        {/* <Route path='/admin' element={<Admin/>}> */}
        {/* Todo esto aparecerá dentro del <Outlet /> de Admin */}

        
      </Routes>    
    </Router>
  )
}

export default Routing
