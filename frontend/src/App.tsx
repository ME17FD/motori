import ProductCard from './components/ProductCard/ProductCard'
import brakeImage from "./assets/a.png";
import Navbar from './components/Navbar/Navbar';
function App() {
  return (
    <>
      <Navbar />
      <div className="products-grid ">
      <ProductCard
        image={brakeImage}
        title="Plaquettes de freins arrière"
        dimensions="12-18 mm x 3 mm"
        price="1500,00 DH"
      />
      <ProductCard
        image="/assets/a.png"
        title="Plaquettes de freins arrière"
        dimensions="12-18 mm x 3 mm"
        price="1500,00 DH"
      />
      <ProductCard
        image="/assets/a.png"
        title="Plaquettes de freins arrière"
        dimensions="12-18 mm x 3 mm"
        price="1500,00 DH"
      />
      <ProductCard
        image="/assets/a.png"
        title="Plaquettes de freins arrière"
        dimensions="12-18 mm x 3 mm"
        price="1500,00 DH"
      />
      <ProductCard
        image="/assets/a.png"
        title="Plaquettes de freins arrière"
        dimensions="12-18 mm x 3 mm"
        price="1500,00 DH"
      />
      <ProductCard
        image="/images/plaquettes.png"
        title="Plaquettes de freins arrière"
        dimensions="12-18 mm x 3 mm"
        price="1500,00 DH"
      />
      <ProductCard
        image="/images/plaquettes.png"
        title="Plaquettes de freins arrière"
        dimensions="12-18 mm x 3 mm"
        price="1500,00 DH"
      />
      </div>
    </>
  )
}

export default App
