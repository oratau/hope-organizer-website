import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default articles untuk ditampilkan di homepage
const DEFAULT_ARTICLES = [
  {
    id: 'art_1',
    title: 'Grand Opening Celebration - Taman Muara Residence',
    category: 'Event Highlights',
    date: 'Jul 15, 2026',
    excerpt: 'A spectacular grand opening ceremony featuring live performances, traditional ceremonies, and exclusive property showcase for Taman Muara Residence.',
    content: `
      <h2>Grand Opening Success</h2>
      <p>HOPE The Organizer proudly presented the grand opening of Taman Muara Residence, one of the most anticipated residential developments in Semarang.</p>
      
      <h3>Event Highlights:</h3>
      <ul>
        <li>Traditional Javanese blessing ceremony</li>
        <li>Live music performances by local artists</li>
        <li>Property showcase and exclusive previews</li>
        <li>Catering for 500+ guests</li>
        <li>Professional photography and videography</li>
      </ul>
      
      <p>The event was attended by city officials, business leaders, and prospective homeowners, creating a memorable launch for this premium residential project.</p>
      
      <blockquote>"HOPE The Organizer delivered an exceptional event that perfectly captured the elegance and prestige of Taman Muara Residence." - Project Director</blockquote>
    `,
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    status: 'published' as const,
  },
  {
    id: 'art_2',
    title: 'Corporate Merchandise Solutions for Leading Brands',
    category: 'Services',
    date: 'Jun 28, 2026',
    excerpt: 'Discover how HOPE creates custom corporate merchandise that strengthens brand identity and leaves lasting impressions.',
    content: `
      <h2>Elevate Your Brand with Premium Merchandise</h2>
      <p>At HOPE The Organizer, we understand that corporate merchandise is more than just promotional items—it's an extension of your brand identity.</p>
      
      <h3>Our Merchandise Services:</h3>
      <ul>
        <li>Custom apparel and uniforms</li>
        <li>Branded promotional products</li>
        <li>Premium gift sets for clients and partners</li>
        <li>Event merchandise and souvenirs</li>
        <li>Corporate giveaways and incentives</li>
      </ul>
      
      <h3>Quality & Customization</h3>
      <p>We work with premium suppliers and manufacturers to ensure every item meets the highest standards. From concept to delivery, our team manages the entire process.</p>
      
      <h3>Recent Projects:</h3>
      <p>We've recently completed merchandise programs for major corporations in banking, technology, and retail sectors, delivering thousands of custom items on schedule and within budget.</p>
    `,
    coverImage: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=800&q=80',
    status: 'published' as const,
  },
  {
    id: 'art_3',
    title: 'Summer Music Festival 2026 - Behind the Scenes',
    category: 'Event Highlights',
    date: 'Jun 10, 2026',
    excerpt: 'Take a look behind the scenes of the Summer Music Festival 2026, where HOPE orchestrated three days of unforgettable performances.',
    content: `
      <h2>A Festival to Remember</h2>
      <p>The Summer Music Festival 2026 brought together over 15,000 music lovers for three days of incredible performances, featuring both local and international artists.</p>
      
      <h3>Event Scale:</h3>
      <ul>
        <li>3-day outdoor festival</li>
        <li>Multiple stages with simultaneous performances</li>
        <li>15,000+ attendees</li>
        <li>30+ artists and performers</li>
        <li>Full production: sound, lighting, and stage design</li>
      </ul>
      
      <h3>Logistics Management:</h3>
      <p>Our team coordinated venue setup, artist accommodations, security, catering, and emergency services. Every detail was meticulously planned to ensure a safe and enjoyable experience.</p>
      
      <h3>Sustainability Focus:</h3>
      <p>We implemented eco-friendly practices including waste management, recycling stations, and partnerships with local environmental organizations.</p>
      
      <blockquote>"HOPE The Organizer's professionalism and attention to detail made this festival a massive success." - Festival Director</blockquote>
    `,
    coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
    status: 'published' as const,
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Return published articles only
  const publishedArticles = DEFAULT_ARTICLES.filter(a => a.status === 'published');

  return res.json({
    success: true,
    articles: publishedArticles,
  });
}
