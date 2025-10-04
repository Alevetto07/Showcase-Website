import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import AnimatedRose from './components/AnimatedRose'
import './App.css'

function App() {
  const canvasWrapperRef = useRef(null)
  const handlersRef = useRef(null)

  // Track scroll progress 0..1 mapped to page scroll position
  const [scrollProgress, setScrollProgress] = useState(0)

  // Global screen-wide interactions: scroll to bloom, drag to rotate
  useEffect(() => {
    function handleWheel(e) {
      if (!handlersRef.current) return
      handlersRef.current.onWheel(e)
    }
    function handleDown(e) {
      if (!handlersRef.current) return
      handlersRef.current.onDown(e)
    }
    function handleUp(e) {
      if (!handlersRef.current) return
      handlersRef.current.onUp(e)
    }
    function handleMove(e) {
      if (!handlersRef.current) return
      handlersRef.current.onMove(e)
    }
    function handleScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      setScrollProgress(p)
      if (handlersRef.current) {
        handlersRef.current.onScrollProgress?.(p)
      }
    }
    // Allow native scrolling to decelerate; we don't hard-stop at the edges
    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('pointerdown', handleDown)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('scroll', handleScroll)
    // Ensure page loads at top
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    handleScroll()
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('pointerdown', handleDown)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const [theme, setTheme] = useState('dark')
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  const [recipeOpen, setRecipeOpen] = useState(false)
  const [recipeData, setRecipeData] = useState(null)

  useEffect(() => {
    // Reflect theme variables on body for CSS var overrides
    if (theme === 'light') {
      document.body.classList.add('theme-light')
    } else {
      document.body.classList.remove('theme-light')
    }
  }, [theme])

  return (
    <BrowserRouter basename="/this_website">
    <div className={`app-container ${theme === 'light' ? 'theme-light' : ''}`} ref={canvasWrapperRef}>
      <nav className="top-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/products" className="nav-link">Products</Link>
        <Link to="/careers" className="nav-link">Careers</Link>
        <button className="theme-toggle" onClick={toggleTheme}>{theme === 'light' ? 'Dark' : 'Light'} mode</button>
      </nav>
      {/* Canvas moved into Home route so other pages are full-bleed content */}

      <Routes>
        <Route path="/" element={
          <>
            <div className="canvas-fixed">
              <Canvas
                style={{ height: '100vh', width: '100vw' }}
                camera={{ position: [0, 0, 8], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
              >
                <ambientLight intensity={0.6} />
                <pointLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
                <pointLight position={[-5, -5, -5]} intensity={0.8} color="#ffe6f0" />

                <AnimatedRose provideHandlers={(h) => (handlersRef.current = h)} />

                <Environment preset="studio" />
              </Canvas>
            </div>
            <div className="overlay-ui">
              <div className="title-section">
                <h1 className="main-title">Animated Test Website</h1>
                <p className="subtitle">This is a test website with an animated blue flower.</p>
              </div>
            </div>
            <div className="page-content">
              <div className="side-column">
                <h3>About the Bloom</h3>
                <p>
                  This page demonstrates a scroll-driven flower bloom. As you read, the flower
                  gradually opens. Drag to rotate; scrolling controls the bloom only.
                </p>
                <p>
                  The animation is mapped to your scroll position, so it will always be closed
                  at the top of the page and fully open at the bottom.
                </p>
                <p>
                  Adjust copy and layout here to suit your brand voice and story.
                </p>
              </div>
              <div className="center-spacer" />
              <div className="side-column">
                <h3>Technical Notes</h3>
                <p>
                  Rendered with React Three Fiber and post-processing, with an animated GLB
                  model scrubbed by scroll position. Camera and interaction are tuned for a
                  calm, elegant feel.
                </p>
                <p>
                  Replace this text with your real content. The center column stays empty so
                  the flower remains unobstructed.
                </p>
                <p>
                  Scroll to the bottom to see the flower fully open.
                </p>
              </div>
            </div>
          </>
        } />
        <Route path="/about" element={
          <div className="page-full route-fade">
            <div className="side-column">
              <h2 className="label-heading">ABOUT</h2>
              <p>
                We craft minimal, raw, and intentional products. Our process is documented like
                a lab experiment: simple ingredients, careful methods, time and patience.
              </p>
              <p>
                This site embraces monochrome restraint and space. Typography is utilitarian;
                every element earns its place.
              </p>
            </div>
            <div className="side-column">
              <h3 className="label-sub">STANDARDS</h3>
              <ul className="label-list">
                <li>Small-batch production</li>
                <li>Transparent sourcing</li>
                <li>Tested. Documented. Repeatable.</li>
              </ul>
            </div>
          </div>
        } />
        <Route path="/products" element={
          <div className="page-full route-fade">
            <div className="side-column">
              <h2 className="label-heading">PRODUCTS</h2>
              <p>Hover to inspect the surface. Click to open the recipe card.</p>
            </div>
            <div className="side-column">
              <div className="product-grid">
                <div className="product-card" onClick={() => { setRecipeData({ batch: '001', date: '2025-10-02', notes: 'Neroli, Bergamot', title: 'CITRUS 001', ingredients: ['Alcohol (denat.)', 'Neroli Oil', 'Bergamot Peel', 'Distilled Water'], method: ['Macerate oils 24h', 'Filter 2µm', 'Rest 7 days', 'Bottle in amber glass'] }); setRecipeOpen(true) }}>
                  <div className="product-image" />
                  <div className="product-label">
                    <div>Batch: 001</div>
                    <div>Date: 2025-10-02</div>
                    <div>Notes: Neroli, Bergamot</div>
                  </div>
                </div>
                <div className="product-card" onClick={() => { setRecipeData({ batch: '002', date: '2025-10-02', notes: 'Vetiver, Cedar', title: 'WOODS 002', ingredients: ['Alcohol (denat.)', 'Vetiver Root', 'Atlas Cedar', 'Distilled Water'], method: ['Tincture 48h', 'Filter 1µm', 'Rest 10 days', 'Bottle matte label'] }); setRecipeOpen(true) }}>
                  <div className="product-image alt" />
                  <div className="product-label">
                    <div>Batch: 002</div>
                    <div>Date: 2025-10-02</div>
                    <div>Notes: Vetiver, Cedar</div>
                  </div>
                </div>
                <div className="product-card" onClick={() => { setRecipeData({ batch: '003', date: '2025-10-02', notes: 'Rose, Labdanum', title: 'RESIN 003', ingredients: ['Alcohol (denat.)', 'Rose Absolute', 'Labdanum Resin', 'Water'], method: ['Warm resin bain-marie', 'Blend 30min', 'Filter 5µm', 'Rest 14 days'] }); setRecipeOpen(true) }}>
                  <div className="product-image" />
                  <div className="product-label">
                    <div>Batch: 003</div>
                    <div>Date: 2025-10-02</div>
                    <div>Notes: Rose, Labdanum</div>
                  </div>
                </div>
                <div className="product-card" onClick={() => { setRecipeData({ batch: '004', date: '2025-10-02', notes: 'Sandalwood, Musk', title: 'SOFT 004', ingredients: ['Alcohol (denat.)', 'Sandalwood Oil', 'White Musk', 'Water'], method: ['Blend oils', 'Rest 3 days', 'Filter 1µm', 'Bottle clear label'] }); setRecipeOpen(true) }}>
                  <div className="product-image alt" />
                  <div className="product-label">
                    <div>Batch: 004</div>
                    <div>Date: 2025-10-02</div>
                    <div>Notes: Sandalwood, Musk</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } />
        <Route path="/careers" element={
          <div className="page-full route-fade">
            <div className="side-column">
              <h2 className="label-heading">CAREERS</h2>
              <p>
                We hire for curiosity, discipline, and care. Send a brief note and a link to
                something you made. Minimal resumes; maximum substance.
              </p>
            </div>
            <div className="side-column">
              <h3 className="label-sub">OPEN ROLES</h3>
              <ul className="label-list">
                <li>Creative Technologist</li>
                <li>Materials Research Intern</li>
                <li>Operations Assistant</li>
              </ul>
            </div>
          </div>
        } />
      </Routes>

      {recipeOpen && (
        <div className="recipe-modal" onClick={() => setRecipeOpen(false)}>
          <div className="recipe-card" onClick={(e) => e.stopPropagation()}>
            <div className="recipe-header">
              <h3 className="recipe-title">{recipeData?.title}</h3>
              <div className="recipe-meta">Batch {recipeData?.batch} — {recipeData?.date}</div>
              <div className="recipe-notes">Notes: {recipeData?.notes}</div>
            </div>
            <div className="recipe-body">
              <div>
                <div className="label-sub">INGREDIENTS</div>
                <ul className="label-list">
                  {recipeData?.ingredients?.map((i, idx) => (<li key={idx}>{i}</li>))}
                </ul>
              </div>
              <div>
                <div className="label-sub">METHOD</div>
                <ol className="label-list">
                  {recipeData?.method?.map((m, idx) => (<li key={idx}>{m}</li>))}
                </ol>
              </div>
            </div>
            <button className="theme-toggle close-btn" onClick={() => setRecipeOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Scrollable content columns to test scroll relation */}
      <div className="page-content">
        <div className="side-column">
          <h3>About the Bloom</h3>
          <p>
            This page demonstrates a scroll-driven flower bloom. As you read, the flower
            gradually opens. Drag to rotate; scrolling controls the bloom only.
          </p>
          <p>
            The animation is mapped to your scroll position, so it will always be closed
            at the top of the page and fully open at the bottom.
          </p>
          <p>
            Adjust copy and layout here to suit your brand voice and story.
          </p>
        </div>
        <div className="center-spacer" />
        <div className="side-column">
          <h3>Technical Notes</h3>
          <p>
            Rendered with React Three Fiber and post-processing, with an animated GLB
            model scrubbed by scroll position. Camera and interaction are tuned for a
            calm, elegant feel.
          </p>
          <p>
            Replace this text with your real content. The center column stays empty so
            the flower remains unobstructed.
          </p>
          <p>
            Scroll to the bottom to see the flower fully open.
          </p>
        </div>
      </div>
    </div>
    </BrowserRouter>
  )
}

export default App
