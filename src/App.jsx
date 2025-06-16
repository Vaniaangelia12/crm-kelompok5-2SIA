//import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MainLayout from './components/MainLayouts'
import ProductManagement from './pages/Product'
import UmpanBalik from './pages/UmpanBalik'
import FAQ from './pages/FAQ'
import Profile from './pages/Profil'

export default function App() {
  return (
   <Routes>
    <Route element={<MainLayout/>}>
    <Route path="/" element={<Dashboard/>}/>
    <Route path="/produk" element={<ProductManagement/>}/>
    <Route path="/umpanbalik" element={<UmpanBalik/>}/>
    <Route path="/faq" element={<FAQ/>}/>
    <Route path="/akun" element={<Profile/>}/>
    </Route>
   </Routes>
  )
}