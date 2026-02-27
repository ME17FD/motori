import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import ProductSlider from "./components/ProductSlider/ProductSlider";
import { mockProducts, type Product } from "./mocks/product";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Si tu as une vraie API
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("API not available");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        // 🔹 Fallback vers mock data
        setProducts(mockProducts);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />

      {loading ? (
        <div style={{ padding: "4rem", textAlign: "center" }}>
          Chargement des produits...
        </div>
      ) : (
        <div style={{ padding: "4rem" }}>
          <ProductSlider products={products} />
        </div>
      )}
    </>
  );
}

export default App;