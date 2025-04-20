import { Link } from "wouter";
import { Recycle, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="h-12 bg-gradient-to-r from-green-600 via-teal-500 to-blue-500"></div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Recycle className="h-6 w-6 text-green-400 mr-2" />
              <span className="font-inter font-bold text-xl">Project Bolt</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Revolutionizing waste management through sustainable technology and community engagement.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-green-400 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-green-400 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-green-400 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-green-400 transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Reports
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/offline" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Offline Mode
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/guides" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Waste Management Guide
                </Link>
              </li>
              <li>
                <Link href="/best-practices" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Recycling Best Practices
                </Link>
              </li>
              <li>
                <Link href="/policies" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Government Policies
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Sustainability Reports
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-gray-300 hover:text-green-400 transition-colors text-sm">
                  Partner Programs
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                <span className="text-gray-300 text-sm">123 Green Street, Eco Park, New Delhi - 110001</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-gray-300 text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-gray-300 text-sm">contact@projectbolt.in</span>
              </li>
            </ul>
            
            <div className="mt-4">
              <Button className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 text-sm">
                Download Our App
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-300">© 2023 Project Bolt. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/privacy" className="text-sm text-gray-300 hover:text-green-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-300 hover:text-green-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-gray-300 hover:text-green-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
