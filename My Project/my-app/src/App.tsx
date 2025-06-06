import React from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Footer from './components/Footer';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <ProductList />
      </main>
      <Footer />
    </div>
  );
};

export default App;
