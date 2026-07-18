import React from 'react';

const Home = () => {
  const textShadowStyle = {
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
  };

  return (
    <main>
      {/* HERO SECTION */}
      <section
        className="bg-cover bg-center bg-no-repeat text-rose-400 py-32 px-6 text-center h-[90vh]"
        style={{
          backgroundImage: "url('/src/assets/shoe1.jpg')",
          ...textShadowStyle,
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Cyman Wear</h1>
        <p className="text-lg max-w-xl mx-auto">
          Discover bold, authentic footwear designed for your stride.
        </p>
      </section>

      {/* MISSION & VISION SECTION */}
      <section
        className="bg-cover bg-center bg-no-repeat text-rose-400 py-28 px-6 text-center h-[80vh]"
        style={{
          backgroundImage: "url('/src/assets/pexels-tima-miroshnichenko-6765524.jpg')",
          ...textShadowStyle,
        }}
      >
        <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
        <p className="mb-8 max-w-2xl mx-auto">
          At Cyman Wear, our mission is to empower confidence through every step.
          We craft high-quality, stylish footwear that blends comfort with innovation for every lifestyle.
        </p>
        <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
        <p className="max-w-2xl mx-auto">
          To redefine fashion-forward footwear in Africa and beyond, merging local craftsmanship with global standards.
        </p>
      </section>

      {/* ABOUT US SECTION */}
      <section
        className="bg-cover bg-center bg-no-repeat text-rose-400 py-28 px-6 text-center h-[80vh]"
        style={{
          backgroundImage: "url('/src/assets/pexels-mnzoutfits-1598505.jpg')",
          ...textShadowStyle,
        }}
      >
        <h2 className="text-3xl font-bold mb-4">About Us</h2>
        <p className="max-w-2xl mx-auto">
          Cyman Wear is more than a brand—we’re a movement.
          Born in Nairobi, raised with African craftsmanship, and driven by global innovation,
          we create footwear that tells your story.
        </p>
      </section>
    </main>
  );
};

export default Home;