import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

/* Aqui van las  importaciones de los componentes y paginas */


import Private_routing from "./Private_routing";


function Routing() {

    //const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado") || "null"); // Obtener el usuario logueado del localStorage


  return (
    <Router>    
      <Routes>    
        {/* Rutas públicas */}
        <Route path='/' element={<Homepage/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/homepage' element={<Homepage/>}/>


        {/* Rutas anidadas del panel de administración */}
        <Route path="/admin" element={
            <Private_route>
              <Admin />
            </Private_route>
          }
        >
        {/* <Route path='/admin' element={<Admin/>}> */}
        {/* Todo esto aparecerá dentro del <Outlet /> de Admin */}

        </Route>
      </Routes>    
    </Router>
  )
}

export default Routing
