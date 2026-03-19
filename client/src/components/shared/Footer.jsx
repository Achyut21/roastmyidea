import { Github, Youtube, Presentation, Figma } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const SOCIAL_LINKS = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/Achyut21/roastmyidea',
    external: true,
  },
  {
    icon: Youtube,
    label: 'YouTube',
    href: '#',
    external: false,
  },
  {
    icon: Presentation,
    label: 'Presentation',
    href: '#',
    external: false,
  },
  {
    icon: Figma,
    label: 'Figma',
    href: '#',
    external: false,
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <Link to="/" className="footer-logo">
            RoastMyIdea
          </Link>
          <p className="footer-tagline">
            Pitch your idea. The internet decides.
          </p>
        </div>

        <nav className="footer-icons" aria-label="External links">
          {SOCIAL_LINKS.map(({ icon: Icon, label, href, external }) => (
            <a
              key={label}
              href={href}
              className="footer-icon-link"
              {...(external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="visually-hidden">{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
