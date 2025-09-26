import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowRightIcon, 
  UserGroupIcon, 
  CalendarDaysIcon, 
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

function Home() {
  const loggedIn = useSelector((state) => state.loggedIn);
  const user = useSelector((state) => state.currentUser);

  const features = [
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: "Alumni Network",
      description: "Connect with fellow graduates from your department and build meaningful professional relationships."
    },
    {
      icon: <CalendarDaysIcon className="h-8 w-8" />,
      title: "Events & Workshops",
      description: "Stay updated with department events, seminars, and professional development workshops."
    },
    {
      icon: <BriefcaseIcon className="h-8 w-8" />,
      title: "Career Opportunities",
      description: "Discover job openings shared by alumni and access exclusive career advancement opportunities."
    },
    {
      icon: <ChatBubbleLeftRightIcon className="h-8 w-8" />,
      title: "Knowledge Sharing",
      description: "Share experiences, insights, and professional achievements with your department community."
    }
  ];

  const stats = [
    { label: "Active Alumni", value: "2,500+" },
    { label: "Department Events", value: "150+" },
    { label: "Job Opportunities", value: "300+" },
    { label: "Success Stories", value: "500+" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-gray-100 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Professional Alumni Network</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Connect. Share. <span className="text-blue-600">Grow.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join our professional alumni network to connect with fellow graduates, 
              share career achievements, and discover new opportunities within your department.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!loggedIn ? (
                <>
                  <Link 
                    to="/register" 
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center group"
                  >
                    Get Started
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link 
                  to="/dashboard" 
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center group"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stay connected
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides comprehensive tools for professional networking, 
              career development, and knowledge sharing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to get started with your professional alumni network
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up and complete your professional profile with your department, graduation year, and career information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect & Engage</h3>
              <p className="text-gray-600">
                Connect with alumni from your department, join events, and participate in professional discussions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Grow Your Career</h3>
              <p className="text-gray-600">
                Access job opportunities, share achievements, and build meaningful professional relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Why choose Alumni Connect?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our platform is designed specifically for professional alumni networking, 
                providing you with the tools and connections you need to advance your career.
              </p>
              
              <div className="space-y-4">
                {[
                  "Department-specific networking and job opportunities",
                  "Professional event management and registration",
                  "Secure, private communication within your network",
                  "Career advancement through peer connections",
                  "Knowledge sharing and mentorship opportunities"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <span className="text-lg font-semibold text-gray-900">Enterprise Grade Security</span>
                </div>
                <p className="text-gray-600 mb-6">
                  Your professional information and connections are protected with enterprise-level security measures.
                </p>
                
                <div className="flex items-center">
                  <GlobeAltIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <span className="text-lg font-semibold text-gray-900">Global Reach</span>
                </div>
                <p className="text-gray-600 mt-2">
                  Connect with alumni worldwide while maintaining department-specific professional networks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!loggedIn && (
        <section className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to advance your career?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of professionals who are already growing their networks and careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center group"
              >
                Start Your Journey
                <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
