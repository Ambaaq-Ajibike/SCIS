'use client';

import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Shield, 
  MessageSquare,
  ArrowRight,
  Heart
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Building2,
      title: 'Service-Level Connected Architecture',
      description: 'Secure, real-time communication framework enabling seamless collaboration across governmental and private healthcare entities'
    },
    {
      icon: Shield,
      title: 'Discretionary Controlled Protocol',
      description: 'Formulated protocol for secure health data exchange with controlled access and error-controlled exchange mechanisms'
    },
    {
      icon: Users,
      title: 'Decentralized Interoperable Network',
      description: 'Robust framework facilitating seamless data sharing among healthcare facilities with FHIR-based compatibility'
    },
    {
      icon: MessageSquare,
      title: 'Real-Time Communication',
      description: 'Intelligent integration mechanisms enabling instant coordination and service delivery across health institutions'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Enterprise-grade authentication procedures ensuring data security and privacy in healthcare administration'
    },
    {
      icon: BarChart3,
      title: 'FHIR Compliance',
      description: 'Adopts fundamental principles from Fast Healthcare Interoperability Resources for efficient healthcare data management'
    }
  ];

  const stats = [
    { number: '500+', label: 'Hospitals Connected' },
    { number: '50K+', label: 'Patients Served' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ];

  const objectives = [
    {
      title: 'Service-Level Architecture',
      description: 'Design of a service-level connected architecture to enable secure, real-time communication across healthcare institutions',
      icon: Building2
    },
    {
      title: 'Data Exchange Protocol',
      description: 'Formulation of a discretionary controlled protocol for health data exchange with error-controlled mechanisms',
      icon: Shield
    },
    {
      title: 'Implementation & Evaluation',
      description: 'Implementation and evaluation of the resultant modules to ensure compatibility and efficiency in healthcare data management',
      icon: BarChart3
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
              <span className="ml-2 text-2xl font-bold text-gray-900">SmartCoIHA</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register-hospital')}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Register Your Hospital
              </button>
              {/* <button
                onClick={() => router.push('/feedback')}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Submit Feedback
              </button> */}
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
                SmartCoIHA
              </h1>
              <p className="text-lg lg:text-xl mb-4 text-primary-100 font-semibold">
                Smart Connected System for Integrated Health Administration
              </p>
              <p className="text-xl lg:text-2xl mb-8 text-primary-100">
                Revolutionizing national healthcare planning, coordination, and service delivery 
                through intelligent integration of health institutions. Establishing a robust framework 
                for seamless collaboration across governmental and private healthcare entities.
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
              Integrated Healthcare Framework
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SmartCoIHA establishes a decentralized, interoperable network for data sharing among 
              healthcare facilities, incorporating real-time communication mechanisms, secure authentication 
              procedures, and error-controlled exchange protocols based on FHIR principles.
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
              Research Objectives
            </h2>
            <p className="text-xl text-gray-600">
              SmartCoIHA is designed to achieve comprehensive healthcare integration objectives
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {objectives.map((objective, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <objective.icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{objective.title}</h3>
                <p className="text-gray-700">{objective.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Revolutionizing National Healthcare Integration
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            SmartCoIHA enables seamless collaboration across governmental and private healthcare entities, 
            establishing a robust framework for intelligent health institution integration and coordinated service delivery.
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
                <span className="ml-2 text-xl font-bold">SmartCoIHA</span>
              </div>
              <p className="text-gray-400">
                Smart Connected System for Integrated Health Administration (SmartCoIHA) - 
                A comprehensive platform revolutionizing national healthcare planning, coordination, 
                and service delivery through intelligent integration of health institutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Core Capabilities</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Service-Level Architecture</li>
                <li>Data Exchange Protocol</li>
                <li>Real-Time Communication</li>
                <li>FHIR Compliance</li>
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
            <p>&copy; 2024 SmartCoIHA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
