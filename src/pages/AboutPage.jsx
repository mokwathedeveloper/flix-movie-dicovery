import React from 'react'
import { Film, Users, Target, Award } from 'lucide-react'

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Film className="w-12 h-12 text-primary-600" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            About Flix
          </h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
          Your ultimate destination for discovering movies and TV shows with intelligent 
          recommendations and personalized watchlist management.
        </p>
      </div>

      {/* Mission Section */}
      <div className="card mb-12">
        <div className="flex items-start space-x-4">
          <Target className="w-8 h-8 text-primary-600 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We believe that finding your next favorite movie or TV show shouldn't be a chore. 
              Flix combines the power of advanced search algorithms, personalized recommendations, 
              and intuitive design to help you discover content that truly resonates with your taste.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card">
          <Users className="w-8 h-8 text-primary-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Personalized Experience
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Our intelligent recommendation engine learns from your preferences to suggest 
            content you'll love, making every discovery feel tailored just for you.
          </p>
        </div>

        <div className="card">
          <Award className="w-8 h-8 text-primary-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Comprehensive Database
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Access detailed information about thousands of movies and TV shows, including 
            cast, crew, reviews, and streaming availability across multiple platforms.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          Built with Passion
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
          Flix is crafted by a team of movie enthusiasts and technology experts who understand 
          the joy of discovering great content. We're committed to continuously improving your 
          experience and helping you find your next binge-worthy series or must-watch film.
        </p>
      </div>
    </div>
  )
}

export default AboutPage
