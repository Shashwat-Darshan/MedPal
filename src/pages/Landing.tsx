import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Brain, Shield, Clock, Users, Star, Sparkles, Heart, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Landing = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Heart className="absolute top-1/4 left-1/4 w-6 h-6 text-red-300/40 animate-pulse delay-500" />
        <Brain className="absolute top-1/3 right-1/4 w-8 h-8 text-blue-300/40 animate-pulse delay-1000" />
        <Shield className="absolute bottom-1/3 left-1/5 w-7 h-7 text-green-300/40 animate-pulse delay-1500" />
        <Sparkles className="absolute top-1/2 right-1/3 w-5 h-5 text-purple-300/40 animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className={`px-4 sm:px-6 lg:px-8 py-6 backdrop-blur-md bg-white/10 dark:bg-gray-950/10 border-b border-white/20 dark:border-gray-800/20 sticky top-0 z-50 transition-all duration-500 ${
        scrollY > 50 ? 'shadow-lg shadow-blue-500/10' : ''
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className={`flex items-center space-x-3 transition-all duration-700 ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-110">
              <Stethoscope className="h-6 w-6 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
              MedPal
            </h1>
          </div>
          <div className={`flex items-center space-x-4 transition-all duration-700 delay-200 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`}>
            <Link to="/auth">
              <Button variant="ghost" className="hover:bg-blue-500/10 hover:text-blue-600 transition-all duration-300 hover:scale-105">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-32 relative">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Healthcare Revolution
              </span>
            </div>
            <h2 className="text-6xl lg:text-8xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              Your Personal
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                Health Oracle
              </span>
            </h2>
            <p className="text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience the future of healthcare with our revolutionary AI assistant. 
              Get instant diagnoses, personalized treatment plans, and 24/7 medical guidance 
              that adapts to your unique health profile.
            </p>
          </div>
          
          <div className={`flex flex-col sm:flex-row gap-6 justify-center transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <Link to="/diagnosis">
              <Button size="lg" className="text-xl px-12 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-2xl hover:shadow-3xl hover:shadow-blue-500/30 transition-all duration-500 hover:scale-110 group relative overflow-hidden">
                <span className="relative z-10 flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 group-hover:animate-pulse" />
                  <span>Start Free Diagnosis</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-xl px-12 py-4 border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <span className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Learn More</span>
              </span>
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className={`mt-20 transition-all duration-1000 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <ArrowDown className="w-6 h-6 text-gray-400 mx-auto animate-bounce" />
            <p className="text-sm text-gray-500 mt-2">Discover the possibilities</p>
          </div>
        </div>

        {/* Parallax Background Effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/80 to-purple-50/50 dark:from-gray-900/50 dark:via-gray-800/80 dark:to-purple-900/50 backdrop-blur-sm"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-6 backdrop-blur-sm">
              <Star className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Why MedPal is Revolutionary
              </span>
            </div>
            <h3 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              Healthcare
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of AI-powered healthcare technology that puts you in control
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Analysis",
                description: "Revolutionary deep learning algorithms that understand medical patterns like a seasoned doctor",
                color: "blue",
                delay: "delay-100"
              },
              {
                icon: Clock,
                title: "Instant Results",
                description: "Get comprehensive health assessments in seconds, not hours or days",
                color: "green",
                delay: "delay-200"
              },
              {
                icon: Shield,
                title: "Privacy First",
                description: "Military-grade encryption ensures your health data remains completely private and secure",
                color: "purple",
                delay: "delay-300"
              },
              {
                icon: Users,
                title: "24/7 Availability",
                description: "Your personal health assistant that never sleeps, always ready to help",
                color: "orange",
                delay: "delay-400"
              },
              {
                icon: Stethoscope,
                title: "Medical Grade",
                description: "Developed in partnership with leading medical professionals and validated by real doctors",
                color: "red",
                delay: "delay-500"
              },
              {
                icon: Star,
                title: "Personalized Care",
                description: "Adaptive AI that learns from your health history to provide truly personalized insights",
                color: "yellow",
                delay: "delay-600"
              }
            ].map((feature, index) => (
              <Card key={index} className={`group p-8 hover:shadow-2xl hover:shadow-${feature.color}-500/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2 border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-800/90 ${feature.delay} animate-fade-in`}>
                <div className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-${feature.color}-500/25`}>
                  <feature.icon className="h-8 w-8 text-white group-hover:animate-pulse" />
                </div>
                <h4 className="text-2xl font-bold mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-6 py-2 mb-8 backdrop-blur-sm">
            <Heart className="w-4 h-4 text-white animate-pulse" />
            <span className="text-sm font-medium text-white">
              Join the Health Revolution
            </span>
          </div>
          
          <h3 className="text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight">
            Ready to Transform
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Your Health Journey?
            </span>
          </h3>
          
          <p className="text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join over <span className="font-bold text-yellow-300">50,000+</span> users who have already discovered 
            the power of AI-driven healthcare. Your health transformation starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/diagnosis">
              <Button size="lg" className="text-xl px-12 py-4 bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 group relative overflow-hidden">
                <span className="relative z-10 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                  <span>Start Your Free Assessment</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-xl px-12 py-4 border-2 border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
              <span className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>See Success Stories</span>
              </span>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="text-white/80">
              <div className="text-3xl font-bold mb-1">50K+</div>
              <div className="text-sm">Happy Users</div>
            </div>
            <div className="text-white/80">
              <div className="text-3xl font-bold mb-1">99.9%</div>
              <div className="text-sm">Accuracy Rate</div>
            </div>
            <div className="text-white/80">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-sm">Support</div>
            </div>
            <div className="text-white/80">
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-sm">Data Breaches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8 py-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MedPal
              </span>
            </div>
            
            <div className="flex space-x-8 text-sm text-gray-600 dark:text-gray-400">
              <Link to="#" className="hover:text-blue-600 transition-colors duration-300">Privacy Policy</Link>
              <Link to="#" className="hover:text-blue-600 transition-colors duration-300">Terms of Service</Link>
              <Link to="#" className="hover:text-blue-600 transition-colors duration-300">Contact Us</Link>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              &copy; 2024 MedPal. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;