import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Film, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Github,
  Heart,
  ExternalLink
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Home', path: '/' },
      { name: 'Search Movies', path: '/search' },
      { name: 'Recommendations', path: '/recommendations' },
      { name: 'Watchlist', path: '/watchlist' },
      { name: 'Analytics', path: '/analytics' }
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Help Center', path: '/help' }
    ],
    resources: [
      { name: 'API Documentation', path: '/api-docs', external: true },
      { name: 'Developer Guide', path: '/developers', external: true },
      { name: 'Community', path: '/community', external: true },
      { name: 'Blog', path: '/blog', external: true }
    ]
  }

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://facebook.com/flix',
      color: 'hover:text-blue-600 dark:hover:text-blue-400'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: 'https://twitter.com/flix',
      color: 'hover:text-sky-500 dark:hover:text-sky-400'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com/company/flix',
      color: 'hover:text-blue-700 dark:hover:text-blue-500'
    },
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/mokwathedeveloper/flix-movie-discovery',
      color: 'hover:text-gray-900 dark:hover:text-gray-100'
    }
  ]

  const contactInfo = [
    {
      icon: Mail,
      text: 'hello@flix.com',
      href: 'mailto:hello@flix.com'
    },
    {
      icon: Phone,
      text: '+1 (555) 123-4567',
      href: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      text: 'San Francisco, CA',
      href: null
    }
  ]

  return (
    <footer className="bg-white dark:bg-dark-200 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Contact Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <Film className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Flix
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Discover your next favorite movie or TV show with personalized recommendations, 
              advanced search, and intelligent watchlist management.
            </p>

            {/* Contact Information */}
            <div className="space-y-3">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon
                const content = (
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{contact.text}</span>
                  </div>
                )

                return contact.href ? (
                  <a key={index} href={contact.href} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Product
            </h3>
            <nav className="space-y-3">
              {footerLinks.product.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Company
            </h3>
            <nav className="space-y-3">
              {footerLinks.company.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Resources & Social */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Resources
            </h3>
            <nav className="space-y-3 mb-8">
              {footerLinks.resources.map((link) => (
                <a
                  key={link.path}
                  href={link.external ? `#${link.path}` : link.path}
                  className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                >
                  <span>{link.name}</span>
                  {link.external && <ExternalLink className="w-3 h-3" />}
                </a>
              ))}
            </nav>

            {/* Social Media Links */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                Follow Us
              </h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 ${social.color} transition-all duration-200 hover:scale-110`}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
              <span>&copy; {currentYear} Flix. All rights reserved.</span>
            </div>

            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>by the Flix team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
