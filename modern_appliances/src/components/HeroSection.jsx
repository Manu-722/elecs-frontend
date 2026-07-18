import React from 'react';

const HeroSection = () => {
  return (
    <section
      className="bg-cover bg-center bg-no-repeat text-white py-32 px-6 text-center h-[80vh]"
      style={{
        backgroundImage: "url('/images/shoe1.jpg')",
      }}
    >
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Cyman Wear</h1>
      <p className="text-lg max-w-xl mx-auto">
        Discover bold, authentic footwear designed for your stride.
      </p>
    </section>
  );
};

export default HeroSection;