//import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MainLayout from './components/MainLayouts'
import SalesManagement from './pages/SalesManagement'
import RiwayatPembelian from './pages/RiwayatPembelian'

export default function App() {
  return (
   <Routes>
    <Route element={<MainLayout/>}>
    <Route path="/" element={<Dashboard/>}/>
    <Route path="/penjualan" element={<SalesManagement/>}/>
    <Route path="/riwayat-pembelian" element={<RiwayatPembelian />} />
    </Route>
   </Routes>
  )
}