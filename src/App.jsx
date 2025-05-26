//import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MainLayout from './components/MainLayouts'
import ProductManagement from './pages/Product'

export default function App() {
  return (
   <Routes>
    <Route element={<MainLayout/>}>
    <Route path="/" element={<Dashboard/>}/>
    <Route path="/produk" element={<ProductManagement/>}/>
    </Route>
   </Routes>
  )
}