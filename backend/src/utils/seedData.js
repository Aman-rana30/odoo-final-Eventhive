import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import TicketType from '../models/TicketType.js';
import Coupon from '../models/Coupon.js';

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await TicketType.deleteMany({});
    await Coupon.deleteMany({});

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@eventhive.com',
        phone: '9876543210',
        passwordHash: hashedPassword,
        roles: ['Admin'],
        loyaltyPoints: 1000
      },
      {
        name: 'Event Manager',
        email: 'manager@eventhive.com',
        phone: '9876543211',
        passwordHash: hashedPassword,
        roles: ['EventManager'],
        loyaltyPoints: 500
      },
      {
        name: 'Volunteer User',
        email: 'volunteer@eventhive.com',
        phone: '9876543212',
        passwordHash: hashedPassword,
        roles: ['Volunteer'],
        loyaltyPoints: 200
      },
      {
        name: 'Regular Attendee',
        email: 'attendee@eventhive.com',
        phone: '9876543213',
        passwordHash: hashedPassword,
        roles: ['Attendee'],
        loyaltyPoints: 100
      }
    ]);

    console.log('✅ Users created');

    // Create events
    const eventManager = users.find(u => u.roles.includes('EventManager'));
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const farFutureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const events = await Event.create([
      {
        title: 'React Developer Conference 2025',
        description: 'Join the biggest React conference in India featuring industry experts, workshops, and networking opportunities. Learn about the latest React features, performance optimization, and best practices.',
        category: 'conference',
        coverImageUrl: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg',
        venue: {
          address: 'Bangalore International Exhibition Centre',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          type: 'indoor'
        },
        startAt: futureDate,
        endAt: new Date(futureDate.getTime() + 8 * 60 * 60 * 1000),
        status: 'Published',
        featured: true,
        organizer: eventManager._id,
        capacity: 500,
        tags: ['react', 'javascript', 'conference', 'tech']
      },
      {
        title: 'Music Festival Mumbai',
        description: 'Experience the biggest music festival in Mumbai with renowned artists from across the globe. Three days of non-stop music, food, and entertainment.',
        category: 'festival',
        coverImageUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
        venue: {
          address: 'Mahalaxmi Race Course',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          type: 'outdoor'
        },
        startAt: new Date(futureDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        endAt: new Date(futureDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: 'Published',
        featured: true,
        organizer: eventManager._id,
        capacity: 5000,
        tags: ['music', 'festival', 'outdoor', 'mumbai']
      },
      {
        title: 'Delhi Cricket Championship',
        description: 'Annual cricket tournament featuring the best local teams. Witness exciting matches and cheer for your favorite team in this thrilling championship.',
        category: 'sports',
        coverImageUrl: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg',
        venue: {
          address: 'Feroz Shah Kotla Ground',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          type: 'outdoor'
        },
        startAt: new Date(futureDate.getTime() + 10 * 24 * 60 * 60 * 1000),
        endAt: new Date(futureDate.getTime() + 12 * 24 * 60 * 60 * 1000),
        status: 'Published',
        organizer: eventManager._id,
        capacity: 2000,
        tags: ['cricket', 'sports', 'tournament', 'delhi']
      },
      {
        title: 'AI/ML Workshop Series',
        description: 'Hands-on workshop series covering machine learning fundamentals, deep learning, and practical AI applications. Perfect for developers and data scientists.',
        category: 'workshop',
        coverImageUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
        venue: {
          address: 'IIT Madras Campus',
          city: 'Chennai',
          state: 'Tamil Nadu',
          country: 'India',
          type: 'indoor'
        },
        startAt: new Date(futureDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        endAt: new Date(futureDate.getTime() + 16 * 24 * 60 * 60 * 1000),
        status: 'Published',
        organizer: eventManager._id,
        capacity: 100,
        tags: ['ai', 'ml', 'workshop', 'tech', 'education']
      },
      {
        title: 'Startup Pitch Competition',
        description: 'Pitch your startup idea to top investors and industry experts. Win funding, mentorship, and valuable connections in this exciting competition.',
        category: 'hackathon',
        coverImageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
        venue: {
          address: 'T-Hub, HITEC City',
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          type: 'indoor'
        },
        startAt: new Date(futureDate.getTime() + 20 * 24 * 60 * 60 * 1000),
        endAt: new Date(futureDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        status: 'Published',
        organizer: eventManager._id,
        capacity: 200,
        tags: ['startup', 'pitch', 'competition', 'funding']
      },
      {
        title: 'Digital Art Exhibition',
        description: 'Explore the future of digital art with interactive installations, VR experiences, and works by renowned digital artists from around the world.',
        category: 'exhibition',
        coverImageUrl: 'https://images.pexels.com/photos/1194760/pexels-photo-1194760.jpeg',
        venue: {
          address: 'National Gallery of Modern Art',
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          type: 'indoor'
        },
        startAt: farFutureDate,
        endAt: new Date(farFutureDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'Published',
        organizer: eventManager._id,
        capacity: 300,
        tags: ['art', 'digital', 'exhibition', 'vr']
      }
    ]);

    console.log('✅ Events created');

    // Create ticket types for each event
    const ticketTypes = [];
    
    for (const event of events) {
      const basePrice = event.category === 'festival' ? 2000 : 
                       event.category === 'conference' ? 1500 :
                       event.category === 'workshop' ? 800 : 500;

      const eventTickets = [
        {
          eventId: event._id,
          name: 'EarlyBird',
          description: 'Limited time early bird discount',
          price: Math.round(basePrice * 0.7),
          saleStartAt: now,
          saleEndAt: new Date(event.startAt.getTime() - 15 * 24 * 60 * 60 * 1000),
          maxQuantity: Math.round(event.capacity * 0.3),
          perUserLimit: 5
        },
        {
          eventId: event._id,
          name: 'General',
          description: 'Standard admission ticket',
          price: basePrice,
          saleStartAt: now,
          saleEndAt: new Date(event.startAt.getTime() - 1 * 60 * 60 * 1000),
          maxQuantity: Math.round(event.capacity * 0.5),
          perUserLimit: 10
        },
        {
          eventId: event._id,
          name: 'Student',
          description: 'Special pricing for students',
          price: Math.round(basePrice * 0.5),
          saleStartAt: now,
          saleEndAt: new Date(event.startAt.getTime() - 1 * 60 * 60 * 1000),
          maxQuantity: Math.round(event.capacity * 0.15),
          perUserLimit: 2
        },
        {
          eventId: event._id,
          name: 'VIP',
          description: 'Premium experience with exclusive benefits',
          price: Math.round(basePrice * 2),
          saleStartAt: now,
          saleEndAt: new Date(event.startAt.getTime() - 1 * 60 * 60 * 1000),
          maxQuantity: Math.round(event.capacity * 0.05),
          perUserLimit: 3
        }
      ];
      
      ticketTypes.push(...eventTickets);
    }

    await TicketType.create(ticketTypes);
    console.log('✅ Ticket types created');

    // Create coupons
    await Coupon.create([
      {
        code: 'WELCOME20',
        type: 'PERCENT',
        value: 20,
        minAmount: 500,
        maxDiscount: 1000,
        validFrom: now,
        validTo: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        usageLimitGlobal: 1000,
        usagePerUser: 1,
        createdBy: eventManager._id
      },
      {
        code: 'STUDENT50',
        type: 'FIXED',
        value: 50,
        minAmount: 200,
        validFrom: now,
        validTo: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        usageLimitGlobal: 500,
        usagePerUser: 1,
        createdBy: eventManager._id
      },
      {
        code: 'EARLYBIRD',
        type: 'PERCENT',
        value: 15,
        minAmount: 1000,
        maxDiscount: 500,
        validFrom: now,
        validTo: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        usageLimitGlobal: 200,
        usagePerUser: 1,
        createdBy: eventManager._id
      }
    ]);

    console.log('✅ Coupons created');
    console.log('🎉 Seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();