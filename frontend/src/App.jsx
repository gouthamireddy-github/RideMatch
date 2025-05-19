// import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Header from './userInterface/component/header/Header';
import MyRidesPage from './userInterface/pages/ride/MyRidesPage';



function App() {
 

  return (
    <>
      <Router>
          <Header />
          <Routes>
            <Route path="/myrides" element={<MyRidesPage/>} />
            {/* <Route path="/dirver/login" element={<} */}
          </Routes>
      </Router> 
        
    </>
  )
}

export default App
