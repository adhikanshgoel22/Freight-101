import HeroSection from "../components/Hero";
import Navbar from "../components/Navbar";
import AboutSection from "../components/About";
import ProjectsSection from "../components/ProjectsSection";
// import EmailSection from "../components/EmailSection";
import Footer from "../components/Footer";
import AchievementsSection from "../components/Achieve";
import Connect from "@/components/Connect";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#121212]">
      <Navbar />
      <div className="container mt-24 mx-auto px-12 py-4">
        <HeroSection />

        <AboutSection />
        <ProjectsSection />
        <Connect />
      </div>
      <Footer />
    </main>
  );
}
