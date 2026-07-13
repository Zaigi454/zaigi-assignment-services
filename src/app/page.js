import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Services from "../components/Services";
import HowItWorks from "../components/HowItWorks";
import WhyChooseUs from "../components/WhyChooseUs";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";
import OrderCTA from "../components/OrderCTA";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Navbar />
      <Hero />
      <Stats />
      <Services />
      <HowItWorks />
      <WhyChooseUs />
      <Pricing />
      <Testimonials />
      <OrderCTA />
      <Footer />
    </main>
  );
}