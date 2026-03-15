export interface Product {
  id: string;
  image: string;
  title: string;
  dimensions: string;
  price: string;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    image: "https://via.placeholder.com/300x300?text=Produit+1",
    title: "Plaquettes de freins arrière",
    dimensions: "12-18 mm x 3 mm",
    price: "1500,00 DH",
  },
  {
    id: "2",
    image: "https://via.placeholder.com/300x300?text=Produit+2",
    title: "Plaquettes sport",
    dimensions: "15-20 mm x 4 mm",
    price: "1800,00 DH",
  },
  {
    id: "3",
    image: "https://via.placeholder.com/300x300?text=Produit+3",
    title: "Plaquettes racing",
    dimensions: "20-25 mm x 5 mm",
    price: "2100,00 DH",
  },
  {
    id: "4",
    image: "https://via.placeholder.com/300x300?text=Produit+4",
    title: "Plaquettes performance",
    dimensions: "18-22 mm x 4 mm",
    price: "1700,00 DH",
  },
  {
    id: "5",
    image: "https://via.placeholder.com/300x300?text=Produit+5",
    title: "Plaquettes carbone",
    dimensions: "22-28 mm x 6 mm",
    price: "2500,00 DH",
  },
  {
    id: "6",
    image: "https://via.placeholder.com/300x300?text=Produit+6",
    title: "Plaquettes ultra pro",
    dimensions: "25-30 mm x 6 mm",
    price: "2900,00 DH",
  },
  {
    id: "7",
    image: "https://via.placeholder.com/300x300?text=Produit+7",
    title: "Plaquettes endurance",
    dimensions: "16-21 mm x 4 mm",
    price: "1600,00 DH",
  },
  {
    id: "8",
    image: "https://via.placeholder.com/300x300?text=Produit+8",
    title: "Plaquettes premium",
    dimensions: "19-23 mm x 5 mm",
    price: "2000,00 DH",
  },
];