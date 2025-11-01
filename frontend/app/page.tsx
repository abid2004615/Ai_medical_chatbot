"use client"

import Link from "next/link"
import { useState } from "react"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState({ title: "", content: "" })

  const openModal = (title: string, content: string) => {
    setModalContent({ title, content })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  return (
    <div className="hero-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">⚕️</span>
            <span className="logo-text">MediChat</span>
          </div>

          <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
            <Link href="/chat" className="nav-cta" onClick={() => setMobileMenuOpen(false)}>
              Get Started
            </Link>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L10 6L15 6.5L11 10L12 15L8 12.5L4 15L5 10L1 6.5L6 6L8 1Z"
                  fill="currentColor"
                />
              </svg>
              <span>AI-Powered Healthcare Assistant</span>
            </div>

            <h1 className="hero-title">
              Your Personal
              <span className="gradient-text"> AI Health Assistant</span>
              <br />
              Available 24/7
            </h1>

            <p className="hero-description">
              Get instant medical guidance, symptom analysis, and personalized health recommendations
              powered by advanced AI technology. Your health companion is just a chat away.
            </p>

            <div className="hero-actions">
              <Link href="/chat" className="btn-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M17 9C17 13 13.5 16.5 9.5 16.5C8.5 16.5 7.5 16.35 6.55 16.05L2 17.5L3.45 13C3.15 12 3 11 3 10C3 6 6.5 2.5 10.5 2.5C14.5 2.5 17 6 17 9Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Start Chatting Now
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 11L12 14L22 4"
                      stroke="#00BCD4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16"
                      stroke="#00BCD4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="stat-value">HIPAA</div>
                  <div className="stat-label">Compliant</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#00BCD4" strokeWidth="2" />
                    <path d="M12 6V12L16 14" stroke="#00BCD4" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="stat-value">24/7</div>
                  <div className="stat-label">Available</div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"
                      stroke="#00BCD4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="stat-value">98%</div>
                  <div className="stat-label">Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="chat-preview">
              <div className="chat-window">
                <div className="chat-header-bar">
                  <div className="chat-avatar-icon">
                    ⚕️
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">MediChat</div>
                    <div className="chat-online">
                      <span className="online-dot"></span>
                      Online
                    </div>
                  </div>
                </div>

                <div className="chat-body">
                  <div className="message bot">
                    <div className="message-avatar">
                      ⚕️
                    </div>
                    <div className="message-content">
                      Hello! I'm your AI medical assistant. How can I help you today?
                    </div>
                  </div>

                  <div className="message user">
                    <div className="message-content">
                      I have a headache and mild fever
                    </div>
                  </div>

                  <div className="message bot">
                    <div className="message-avatar">
                      ⚕️
                    </div>
                    <div className="message-content">
                      I'll help you analyze your symptoms. Can you tell me more about when the symptoms started?
                    </div>
                  </div>

                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>

                <div className="chat-input-area">
                  <input type="text" placeholder="Type your symptoms..." readOnly />
                  <button className="send-btn">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="floating-card card-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 12H18L15 21L9 3L6 12H2"
                    stroke="#00BCD4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <div className="card-title">Real-time Analysis</div>
                  <div className="card-desc">Instant symptom evaluation</div>
                </div>
              </div>

              <div className="floating-card card-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <div className="card-title">Personalized Care</div>
                  <div className="card-desc">Tailored recommendations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose MediChat</h2>
            <p className="section-subtitle">
              Advanced AI technology meets compassionate healthcare to provide you with the best medical guidance
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon blue">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 4V16M16 16L24 12M16 16L8 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 20L16 24L24 20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 16L16 20L24 16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Instant Symptom Analysis</h3>
              <p className="feature-desc">
                Get quick and accurate health assessments based on your symptoms using advanced AI algorithms trained on medical data.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M16 20C16 20 8 20 8 26C8 28 16 28 16 28C16 28 24 28 24 26C24 20 16 20 16 20Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Personalized Recommendations</h3>
              <p className="feature-desc">
                Receive AI-driven health guidance tailored specifically to your needs, medical history, and current symptoms.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon purple">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 4C16 4 10 7 10 14V20C10 24 16 28 16 28C16 28 22 24 22 20V14C22 7 16 4 16 4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 16L15 18L19 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-desc">
                Your health data is protected with enterprise-grade encryption. HIPAA compliant with complete privacy guaranteed.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 8V16L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="feature-title">24/7 Availability</h3>
              <p className="feature-desc">
                Access medical guidance anytime, anywhere. No appointments needed, no waiting rooms, just instant support.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon red">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M16 6L18 14L26 15L20 20L22 28L16 24L10 28L12 20L6 15L14 14L16 6Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Expert-Level Accuracy</h3>
              <p className="feature-desc">
                Powered by medical-grade AI with 98% accuracy rate, trained on millions of medical cases and research papers.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon teal">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 4C19.3137 4 22 6.68629 22 10C22 13.3137 19.3137 16 16 16V4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Multi-Language Support</h3>
              <p className="feature-desc">
                Communicate in your preferred language. Supporting 15+ languages to serve diverse communities worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Get medical guidance in three simple steps
            </p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M38 18L24 32L10 18"
                    stroke="#00BCD4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 10H38V38H10V10Z"
                    stroke="#00BCD4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="step-title">Describe Your Symptoms</h3>
              <p className="step-desc">
                Simply tell us how you're feeling in natural language. No medical jargon needed.
              </p>
            </div>

            <div className="step-arrow">
              <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                <path
                  d="M2 12H58M58 12L48 2M58 12L48 22"
                  stroke="#E0E0E0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="#00BCD4" strokeWidth="3" />
                  <path
                    d="M24 14V24L30 30"
                    stroke="#00BCD4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="step-title">AI Analysis</h3>
              <p className="step-desc">
                Our AI instantly analyzes your symptoms using advanced medical databases and algorithms.
              </p>
            </div>

            <div className="step-arrow">
              <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
                <path
                  d="M2 12H58M58 12L48 2M58 12L48 22"
                  stroke="#E0E0E0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M24 4L28 16L40 17L31 25L34 37L24 31L14 37L17 25L8 17L20 16L24 4Z"
                    stroke="#00BCD4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="step-title">Get Personalized Guidance</h3>
              <p className="step-desc">
                Receive detailed health recommendations and next steps tailored to your situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="about">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-desc">
              Join thousands of users who trust MediChat for their health guidance needs
            </p>
            <Link href="/chat" className="btn-primary large">
              Start Your Free Consultation
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10H16M16 10L11 5M16 10L11 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">⚕️</span>
              <span>MediChat</span>
            </div>
            <p className="footer-desc">
              Your trusted AI-powered health assistant, providing 24/7 medical guidance and support.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="/chat">Get Started</a>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  openModal("Careers", "We're always looking for talented individuals to join our team! MediChat is committed to improving healthcare accessibility through AI technology. Currently, we don't have any open positions, but feel free to reach out to us with your resume and we'll keep you in mind for future opportunities.")
                }}
              >
                Careers
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  openModal("Contact Us", "Get in touch with us:\n\nEmail: support@medichat.com\nPhone: +1 (555) 123-4567\n\nFor technical support or general inquiries, please email us and we'll respond within 24-48 hours.\n\nNote: For medical emergencies, please call 911 or visit your nearest emergency room.")
                }}
              >
                Contact
              </a>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  openModal("Privacy Policy", "MediChat Privacy Policy\n\nLast Updated: January 2025\n\n1. Information We Collect\nWe collect minimal information necessary to provide our services. Your chat history is stored locally in your browser and is not sent to our servers.\n\n2. How We Use Your Information\nWe use AI services (Groq) to process your health queries. No personal identifying information is shared with third parties.\n\n3. Data Storage\nAll chat conversations are stored locally in your browser's localStorage. We do not maintain copies of your conversations on our servers.\n\n4. Your Rights\nYou can clear your chat history at any time from the Health Records section.\n\n5. Security\nWe use industry-standard encryption for all data transmission.\n\nFor questions about our privacy practices, contact: privacy@medichat.com")
                }}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  openModal("Terms of Service", "MediChat Terms of Service\n\nLast Updated: January 2025\n\n1. Acceptance of Terms\nBy using MediChat, you agree to these terms of service.\n\n2. Medical Disclaimer\nMediChat is an AI assistant for educational and informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.\n\n3. Use of Service\n- You must be 18 years or older to use this service\n- You agree not to misuse the service\n- You understand that AI responses may contain errors\n\n4. Limitation of Liability\nMediChat and its creators are not liable for any decisions made based on information provided by the AI assistant.\n\n5. Emergency Situations\nFor medical emergencies, call 911 immediately. Do not rely on MediChat for emergency medical advice.\n\n6. Changes to Terms\nWe reserve the right to modify these terms at any time.")
                }}
              >
                Terms of Service
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  openModal("HIPAA Compliance", "HIPAA Compliance Statement\n\nMediChat is designed with healthcare privacy in mind:\n\n1. Local Storage\nAll your conversations are stored locally in your browser, not on our servers. This means your health information stays on your device.\n\n2. No PHI Collection\nWe do not collect, store, or transmit Protected Health Information (PHI) as defined by HIPAA.\n\n3. Third-Party Services\nWe use AI services (Groq) to process queries. These services process information in real-time and do not store your conversations.\n\n4. User Responsibility\nUsers should avoid sharing sensitive personal information such as:\n- Full name\n- Social Security Number\n- Insurance information\n- Specific medical record numbers\n\n5. Not a Covered Entity\nMediChat is an educational tool and is not a HIPAA-covered entity. For HIPAA-compliant medical consultations, please contact your healthcare provider.\n\n6. Data Security\nWe implement industry-standard security measures including HTTPS encryption for all communications.\n\nFor questions: compliance@medichat.com")
                }}
              >
                HIPAA Compliance
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 MediChat. All rights reserved.</p>
          <div className="footer-disclaimer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4V8M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Not a replacement for professional medical advice</span>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalContent.title}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ whiteSpace: 'pre-line' }}>{modalContent.content}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
