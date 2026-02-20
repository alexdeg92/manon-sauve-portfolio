"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import About from "@/components/About";
import Contact from "@/components/Contact";
import ContactModal from "@/components/ContactModal";
import Footer from "@/components/Footer";
import { Painting, paintings as staticPaintings } from "@/data/paintings";

export default function Home() {
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paintings, setPaintings] = useState<Painting[]>(staticPaintings);

  // Fetch latest paintings from KV (admin-managed), fallback to static if KV empty/error
  useEffect(() => {
    fetch("/api/paintings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPaintings(data);
        }
        // If empty or error, keep the static data as fallback
      })
      .catch(() => {
        // Keep static data on error — gallery always shows something
      });
  }, []);

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
        <Gallery paintings={paintings} onSelect={handleSelectPainting} />
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
