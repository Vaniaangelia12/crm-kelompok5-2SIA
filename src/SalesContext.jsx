// src/SalesContext.jsx
import React, { createContext, useState } from "react";

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([
    {
      id: 1,
      invoice: "INV-001",
      customerName: "Pembelian Kopi Latte",
      date: "2025-05-30",
      total: 35000,
      status: "Lunas",
    },
    {
      id: 2,
      invoice: "INV-002",
      customerName: "Pembelian Espresso",
      date: "2025-05-25",
      total: 28000,
      status: "Lunas",
    },
    {
      id: 3,
      invoice: "INV-003",
      customerName: "Pembelian Paket Spesial",
      date: "2025-05-20",
      total: 85000,
      status: "Lunas",
    },
  ]);

  return (
    <SalesContext.Provider value={{ sales, setSales }}>
      {children}
    </SalesContext.Provider>
  );
};
