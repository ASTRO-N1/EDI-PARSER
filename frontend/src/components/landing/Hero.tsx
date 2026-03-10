import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import UploadZone from './UploadZone'
import HeroIllustration from './HeroIllustration'
import { StarDoodle, SmallStar, DotCluster, ScribbleUnderline, SparkleIcon } from './DoodleElements'

function X12Badge() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        background: '#FFE66D',
        border: '2px solid #1A1A2E',
        borderRadius: 999,
        boxShadow: '3px 3px 0px #1A1A2E',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 800,
        fontSize: 14,
        color: '#1A1A2E',
        transform: 'rotate(-1deg)',
        marginBottom: 24,
        width: 'fit-content',
      }}
    >
      🏥&nbsp; X12 837 · 835 · 834
    </div>
  )
}

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section
      ref={ref}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 40,
        paddingLeft: 'clamp(24px, 6vw, 80px)',
        paddingRight: 'clamp(24px, 4vw, 48px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative doodles */}
      <StarDoodle
        size={36}
        color="#FFE66D"
        style={{ position: 'absolute', top: 120, right: '12%', opacity: 0.7, animation: 'arm-wave 3s ease-in-out infinite' }}
      />
      <SmallStar
        color="#FF6B6B"
        style={{ position: 'absolute', top: 200, left: '5%', opacity: 0.5, animation: 'arm-wave 4s ease-in-out infinite 1s' }}
      />
      <DotCluster
        color="#4ECDC4"
        style={{ position: 'absolute', bottom: 120, left: '8%', opacity: 0.6 }}
      />
      <SmallStar
        color="#4ECDC4"
        style={{ position: 'absolute', bottom: 200, right: '5%', opacity: 0.4 }}
      />
      <SparkleIcon
        size={28}
        color="#FF6B6B"
        style={{ position: 'absolute', top: 300, right: '48%', opacity: 0.4 }}
      />

      {/* Left: Text + Upload */}
      <div
        style={{
          flex: '0 0 55%',
          maxWidth: '55%',
          paddingRight: 'clamp(16px, 3vw, 48px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <X12Badge />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h1
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: 8,
            }}
          >
            <span style={{ display: 'block', fontSize: 'clamp(40px, 5.5vw, 64px)', color: '#1A1A2E' }}>
              Parse. Validate.
            </span>
            <span style={{ display: 'block', fontSize: 'clamp(40px, 5.5vw, 64px)', color: '#FF6B6B', position: 'relative' }}>
              Fix.
              <span style={{ display: 'block', marginTop: 2 }}>
                <ScribbleUnderline width={90} color="#FF6B6B" animated />
              </span>
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 400,
            fontSize: 18,
            color: 'rgba(26,26,46,0.7)',
            maxWidth: 480,
            lineHeight: 1.6,
            marginBottom: 36,
            marginTop: 16,
          }}
        >
          The open-source EDI validator that actually explains what went wrong — and tells you how to fix it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <UploadZone />
        </motion.div>
      </div>

      {/* Right: Hero Illustration */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
        className="flex items-center justify-center"
        style={{
          flex: '0 0 45%',
          maxWidth: '45%',
          height: 'clamp(380px, 45vw, 560px)',
          position: 'relative',
        }}
      >
        <HeroIllustration />
      </motion.div>
    </section>
  )
}
