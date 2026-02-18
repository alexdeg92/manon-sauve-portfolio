"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import ContactModal from "@/components/ContactModal";
import Footer from "@/components/Footer";
import { Painting } from "@/data/paintings";

export default function Home() {
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectPainting = (painting: Painting) => {
    setSelectedPainting(painting);
    setModalOpen(true);
  };

  const handleOpenContact = () => {
    setSelectedPainting(null);
    setModalOpen(true);
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Gallery onSelect={handleSelectPainting} />
        <About />
        <Contact onOpenContact={handleOpenContact} />
      </main>
      <Footer />
      <ContactModal
        painting={selectedPainting}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
