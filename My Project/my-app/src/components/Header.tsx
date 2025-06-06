import React from 'react';
import '../styles/Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <h1>Clothing Store</h1>
      <nav>
        <a href="#products">Products</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
};

export default Header;
