'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Shield, 
  Brain, 
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Star,
  Heart,
  Activity,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: Building2,
      title: 'Hospital Management',
      description: 'Comprehensive hospital administration with real-time performance monitoring'
    },
    {
      icon: Users,
      title: 'Patient Management',
      description: 'Secure patient records with biometric consent and FHIR compliance'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'AI-powered insights and performance analytics for better decision making'
    },
    {
      icon: Shield,
      title: 'Security & Privacy',
      description: 'Enterprise-grade security with role-based access control and audit logging'
    },
    {
      icon: Brain,
      title: 'Machine Learning',
      description: 'Predictive analytics, sentiment analysis, and intelligent resource planning'
    },
    {
      icon: MessageSquare,
      title: 'Patient Feedback',
      description: 'Real-time patient feedback collection with sentiment analysis and TES scoring'
    }
  ];

  const stats = [
    { number: '500+', label: 'Hospitals Connected' },
    { number: '50K+', label: 'Patients Served' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      hospital: 'City General Hospital',
      content: 'SCIS has revolutionized our patient care with its intelligent analytics and seamless interoperability.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Hospital Administrator',
      hospital: 'Metro Medical Center',
      content: 'The real-time insights and performance monitoring have significantly improved our operational efficiency.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'IT Director',
      hospital: 'Regional Health Center',
      content: 'The FHIR compliance and security features give us confidence in our data management.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">SCIS</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Hospital Login
              </button>
              <button
                onClick={() => router.push('/system-manager-login')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                System Manager
              </button>
              <button
                onClick={() => router.push('/feedback')}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Smart Connected Integrated System
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-primary-100">
                Transforming healthcare administration through intelligent connected systems, 
                patient feedback analysis, and predictive resource planning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/login')}
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => router.push('/feedback')}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-sm">Patients</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Building2 className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-sm">Hospitals</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-sm">Uptime</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 text-center">
                    <Heart className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-2xl font-bold">4.9★</div>
                    <div className="text-sm">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our integrated platform provides everything you need to manage healthcare operations, 
              analyze patient feedback, and optimize resource allocation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our users say about SCIS
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-primary-600">{testimonial.hospital}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Transform Your Healthcare Operations?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of healthcare institutions already using SCIS to improve patient care 
            and operational efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => router.push('/feedback')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Submit Patient Feedback
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Building2 className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold">SCIS</span>
              </div>
              <p className="text-gray-400">
                Smart Connected Integrated System for modern healthcare administration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Hospital Management</li>
                <li>Patient Analytics</li>
                <li>Feedback System</li>
                <li>ML Insights</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Status Page</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>HIPAA Compliance</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SCIS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
