import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Asterisk, Planet, Target, ArrowRight } from '@phosphor-icons/react';
import { Button, Icon } from '../../components/ui';
import { Link } from 'react-router';
import Asteroid3D from '../../components/asteroid/Asteroid3D';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  // Parallax effects
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const yEarth = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  const yAsteroid = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-[200vh] bg-bg-void text-ink-primary overflow-hidden">
      {/* Background Layer - Cosmic Void */}
      <motion.div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ y: yBg }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: 'url(/assets/cosmic-void-bg@1x.webp)' }}
        />
        {/* Gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-void/40 via-bg-void/80 to-bg-void" />
      </motion.div>

      {/* Earth Layer */}
      <motion.div 
        className="fixed bottom-[-20vh] left-0 right-0 h-[60vh] z-10 pointer-events-none flex justify-center"
        style={{ y: yEarth }}
      >
        <div className="relative w-full max-w-[1200px] h-full">
          <img 
            src="/assets/earth-from-space@1x.webp" 
            alt="Earth from space" 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] max-w-none object-cover opacity-80"
            style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
          />
        </div>
      </motion.div>

      {/* Asteroid Trajectory Layer */}
      <motion.div 
        className="fixed top-[10vh] right-[10vw] w-[300px] h-[300px] z-20 pointer-events-none hidden md:block"
        style={{ y: yAsteroid }}
      >
        {/* Trajectory line */}
        <div className="absolute top-1/2 left-1/2 w-[200%] h-[2px] bg-gradient-to-r from-transparent via-danger-fire/50 to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-45 blur-[1px]" />
        <div className="absolute top-1/2 left-1/2 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-danger-fire to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-45" />
        
        {/* 3D Asteroid */}
        <div className="absolute inset-0 pointer-events-auto">
          <Asteroid3D type="rocky" size={1.5} />
        </div>
      </motion.div>

      {/* Content Layer */}
      <div className="relative z-30">
        {/* Hero Section */}
        <motion.section 
          className="min-h-[100vh] flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center"
          style={{ opacity: opacityHero }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center gap-6 max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 text-[var(--fs-sm)] uppercase tracking-[0.2em] text-accent-cyan font-mono">
              <Icon icon={Asterisk} size="sm" weight="bold" className="animate-pulse" />
              Asteroid Impact Simulator
            </span>
            
            <h1 className="font-display text-[var(--fs-4xl)] md:text-[var(--fs-5xl)] text-ink-primary leading-[var(--lh-display)] tracking-tight drop-shadow-deep">
              Calculate the <span className="text-danger-fire">unthinkable</span>.
            </h1>
            
            <p className="text-ink-muted text-[var(--fs-lg)] max-w-2xl leading-relaxed">
              A scientifically grounded simulation built on the Collins-Melosh-Marcus 2005 model. 
              Adjust parameters and visualize the devastating effects of cosmic impacts.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/simulator">
                <Button variant="primary" size="lg" className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-danger-fire/0 via-white/20 to-danger-fire/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Icon icon={Target} size="sm" weight="bold" />
                  Launch Simulator
                  <Icon icon={ArrowRight} size="sm" weight="bold" className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="ghost" size="lg" className="backdrop-blur-sm bg-bg-elevated/30 border border-ink-faint/30 hover:bg-bg-elevated/50">
                <Icon icon={Planet} size="sm" />
                Read Methodology
              </Button>
            </div>
          </motion.div>
        </motion.section>

        {/* Features/Details Section (Scroll target) */}
        <section className="min-h-[100vh] bg-bg-deep/90 backdrop-blur-md border-t border-ink-faint/20 px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-bg-elevated border border-ink-faint flex items-center justify-center text-accent-cyan">
                  <Icon icon={Target} size="lg" />
                </div>
                <h3 className="font-display text-[var(--fs-xl)]">Precise Targeting</h3>
                <p className="text-ink-muted leading-relaxed">
                  Select any location on Earth using our interactive MapLibre interface. 
                  Visualize damage radii overlaid on real-world geography.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-bg-elevated border border-ink-faint flex items-center justify-center text-danger-amber">
                  <Icon icon={Asterisk} size="lg" />
                </div>
                <h3 className="font-display text-[var(--fs-xl)]">Scientific Rigor</h3>
                <p className="text-ink-muted leading-relaxed">
                  Powered by the peer-reviewed Collins-Melosh-Marcus equations. 
                  Calculates crater size, thermal radiation, seismic shaking, and ejecta.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-bg-elevated border border-ink-faint flex items-center justify-center text-success-aurora">
                  <Icon icon={Planet} size="lg" />
                </div>
                <h3 className="font-display text-[var(--fs-xl)]">Historical Scenarios</h3>
                <p className="text-ink-muted leading-relaxed">
                  Explore pre-configured historical impacts like the Chicxulub dinosaur-killer, 
                  Tunguska event, or the Barringer crater.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
