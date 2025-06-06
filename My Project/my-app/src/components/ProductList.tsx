import React from 'react';
import ProductCard from './ProductCard';
import '../styles/ProductList.css';

const products = [
  { name: 'T-Shirt', price: '$20', imageUrl: 'https://via.placeholder.com/150' },
  { name: 'Jeans', price: '$50', imageUrl: 'https://via.placeholder.com/150' },
  { name: 'Jacket', price: '$80', imageUrl: 'https://via.placeholder.com/150' },
  { name: 'Shoes', price: '$100', imageUrl: 'https://via.placeholder.com/150' },
];

const ProductList: React.FC = () => {
  return (
    <section className="product-list" id="products">
      <h2>Our Products</h2>
      <div className="products-grid">
        {products.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </div>
    </section>
  );
};

export default ProductList;
