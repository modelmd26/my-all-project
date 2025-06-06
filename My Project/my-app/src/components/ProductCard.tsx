import React from 'react';
import '../styles/ProductCard.css';

interface ProductProps {
  name: string;
  price: string;
  imageUrl: string;
}

const ProductCard: React.FC<ProductProps> = ({ name, price, imageUrl }) => {
  return (
    <div className="product-card">
      <img src={imageUrl} alt={name} />
      <h3>{name}</h3>
      <p>{price}</p>
      <button>Buy Now</button>
    </div>
  );
};

export default ProductCard;
