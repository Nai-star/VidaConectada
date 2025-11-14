import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


import Home from '../Pages/Home/Home'


import Private_routing from "./Private_routing";


function Routing() {

    //const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado") || "null"); // Obtener el usuario logueado del localStorage


  return (
    <Router>    
      <Routes>    
        {/* Rutas públicas */}
        <Route path='/' element={<Home/>}/>
        <Route path='/home' element={<Home/>}/>
        




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
