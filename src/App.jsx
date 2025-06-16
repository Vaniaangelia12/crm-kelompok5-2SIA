//import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import MainLayout from './components/MainLayouts'
import CustomerManagement from './pages/CustomerManagement'
import SalesManagement from './pages/SalesManagement'
import ProductManagement from './pages/Product'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import UmpanBalik from './pages/UmpanBalik'
import RiwayatPembelian from './pages/RiwayatPembelian'
import FAQ from './pages/FAQ'
import Profile from './pages/Profil'

export default function App() {
  return (
   <Routes>
      <Route element={<MainLayout/>}>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/pelanggan" element={<CustomerManagement/>}/>
        <Route path="/penjualan" element={<SalesManagement/>}/>
        <Route path="/produk" element={<ProductManagement/>}/>
        <Route path="/umpanbalik" element={<UmpanBalik/>}/>
        <Route path="/riwayat-pembelian" element={<RiwayatPembelian />} />        
      </Route>
      <Route path="/signup" element={<SignUp/>}/>
      <Route path="/signin" element={<SignIn/>}/>
      <Route path="/forgot-password" element={<ForgotPassword />} />
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
