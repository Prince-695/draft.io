import pool from './config/database';
import { getDB, connectMongoDB } from './config/mongodb';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Sample data
const users = [
  { username: 'techguru', email: 'tech@gmail.com', fullName: 'Alex Tech', bio: 'Tech enthusiast and developer' },
  { username: 'ai_researcher', email: 'ai@gmail.com', fullName: 'Sarah AI', bio: 'AI/ML researcher and educator' },
  { username: 'webdev_pro', email: 'web@gmail.com', fullName: 'Mike Developer', bio: 'Full-stack web developer' },
  { username: 'data_scientist', email: 'data@gmail.com', fullName: 'Emily Data', bio: 'Data science & analytics expert' },
  { username: 'mobile_dev', email: 'mobile@gmail.com', fullName: 'Chris Mobile', bio: 'Mobile app developer' },
  { username: 'devops_ninja', email: 'devops@gmail.com', fullName: 'Jordan DevOps', bio: 'DevOps and cloud architect' },
  { username: 'cybersec_expert', email: 'security@gmail.com', fullName: 'Sam Security', bio: 'Cybersecurity specialist' },
  { username: 'blockchain_dev', email: 'blockchain@gmail.com', fullName: 'Taylor Blockchain', bio: 'Blockchain developer' },
  { username: 'gamedev', email: 'game@gmail.com', fullName: 'Casey Games', bio: 'Game developer and designer' },
  { username: 'ui_ux_designer', email: 'design@gmail.com', fullName: 'Morgan Design', bio: 'UI/UX designer and researcher' },
];

const blogTopics = [
  {
    title: 'Getting Started with Next.js 15',
    excerpt: 'Learn how to build modern web applications with the latest Next.js features including server components, app router, and more.',
    tags: ['nextjs', 'react', 'web development'],
    category: 'Web Development',
  },
  {
    title: 'Understanding Machine Learning Algorithms',
    excerpt: 'A comprehensive guide to the most popular machine learning algorithms and when to use them in real-world applications.',
    tags: ['machine learning', 'ai', 'data science'],
    category: 'AI/ML',
  },
  {
    title: 'Building Scalable APIs with Node.js',
    excerpt: 'Best practices for designing and implementing RESTful APIs that can handle millions of requests efficiently.',
    tags: ['nodejs', 'api', 'backend'],
    category: 'Backend',
  },
  {
    title: 'Docker and Kubernetes in Production',
    excerpt: 'Everything you need to know about containerization and orchestration for production environments.',
    tags: ['docker', 'kubernetes', 'devops'],
    category: 'DevOps',
  },
  {
    title: 'React Hooks Deep Dive',
    excerpt: 'Master React Hooks with practical examples and learn how to build custom hooks for your applications.',
    tags: ['react', 'javascript', 'hooks'],
    category: 'Frontend',
  },
  {
    title: 'Cybersecurity Best Practices for Developers',
    excerpt: 'Essential security practices every developer should follow to protect their applications and user data.',
    tags: ['security', 'cybersecurity', 'best practices'],
    category: 'Security',
  },
  {
    title: 'Introduction to Blockchain Technology',
    excerpt: 'Understand the fundamentals of blockchain, cryptocurrencies, and decentralized applications.',
    tags: ['blockchain', 'crypto', 'web3'],
    category: 'Blockchain',
  },
  {
    title: 'Responsive Design with Tailwind CSS',
    excerpt: 'Create beautiful, responsive user interfaces with utility-first CSS framework Tailwind CSS.',
    tags: ['css', 'tailwind', 'design'],
    category: 'Design',
  },
  {
    title: 'Python for Data Analysis',
    excerpt: 'Learn how to use Python libraries like Pandas, NumPy, and Matplotlib for effective data analysis.',
    tags: ['python', 'data analysis', 'pandas'],
    category: 'Data Science',
  },
  {
    title: 'Building Mobile Apps with React Native',
    excerpt: 'Cross-platform mobile development made easy with React Native. Build iOS and Android apps with one codebase.',
    tags: ['react native', 'mobile', 'cross-platform'],
    category: 'Mobile',
  },
];

const generateBlogContent = (title: string, topic: string): string => {
  return `
    <h2>Introduction</h2>
    <p>Welcome to this comprehensive guide on ${title}. In this article, we'll explore the key concepts and practical applications.</p>
    
    <h2>Why This Matters</h2>
    <p>Understanding ${topic} is crucial in today's fast-paced tech industry. It enables developers to build better, more efficient solutions.</p>
    
    <h2>Key Concepts</h2>
    <ul>
      <li>Core principles and fundamentals</li>
      <li>Best practices and patterns</li>
      <li>Common pitfalls to avoid</li>
      <li>Real-world use cases</li>
    </ul>
    
    <h2>Getting Started</h2>
    <p>Let's dive into the practical aspects. We'll start with the basics and gradually move to more advanced topics.</p>
    
    <pre><code>// Example code snippet
const example = () => {
  console.log("Hello, ${topic}!");
  return "Success";
};
</code></pre>
    
    <h2>Advanced Techniques</h2>
    <p>Once you've mastered the basics, you can explore these advanced techniques to take your skills to the next level.</p>
    
    <h2>Conclusion</h2>
    <p>We've covered the essentials of ${title}. Keep practicing and experimenting to deepen your understanding.</p>
    
    <p><strong>Happy coding!</strong></p>
  `;
};

async function createUser(userData: typeof users[0]) {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const userId = uuidv4();

  // Insert into users table
  const userResult = await pool.query(
    `INSERT INTO users (id, username, email, password_hash, full_name, is_verified, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
     RETURNING id`,
    [userId, userData.username, userData.email, hashedPassword, userData.fullName]
  );

  const actualUserId = userResult.rows[0]?.id || userId;

  // Insert into user_profiles table
  await pool.query(
    `INSERT INTO user_profiles (user_id, bio, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     ON CONFLICT (user_id) DO UPDATE SET bio = $2, updated_at = NOW()`,
    [actualUserId, userData.bio]
  );

  return actualUserId;
}

async function createBlog(userId: string, blogData: typeof blogTopics[0], index: number) {
  const blogId = uuidv4();
  const slug = `${blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}-${Date.now()}`;

  // Insert blog metadata into PostgreSQL
  await pool.query(
    `INSERT INTO blogs (id, author_id, title, slug, excerpt, cover_image_url, status, published_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'published', NOW(), NOW(), NOW())`,
    [
      blogId,
      userId,
      blogData.title,
      slug,
      blogData.excerpt,
      `https://picsum.photos/seed/${blogId}/800/450`,
    ]
  );

  // Insert blog content into MongoDB
  const db = getDB();
  await db.collection('blog_content').insertOne({
    blog_id: blogId,
    author_id: userId,
    content: generateBlogContent(blogData.title, blogData.category),
    content_html: generateBlogContent(blogData.title, blogData.category),
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Add some random stats
  const views = Math.floor(Math.random() * 5000) + 100;
  const likes = Math.floor(Math.random() * 500) + 10;
  const comments = Math.floor(Math.random() * 50) + 1;

  await pool.query(
    `UPDATE blogs SET views_count = $1, likes_count = $2, comments_count = $3 WHERE id = $4`,
    [views, likes, comments, blogId]
  );

  // Add tags
  for (const tag of blogData.tags) {
    try {
      // Create tag if doesn't exist
      const tagResult = await pool.query(
        `INSERT INTO tags (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET usage_count = tags.usage_count + 1 RETURNING id`,
        [tag, tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')]
      );

      const tagId = tagResult.rows[0].id;

      // Associate tag with blog
      await pool.query(
        `INSERT INTO blog_tags (blog_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [blogId, tagId]
      );
    } catch (error) {
      console.error(`Error adding tag ${tag}:`, error);
    }
  }

  console.log(`Created blog: ${blogData.title} by user ${userId}`);
  return blogId;
}

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Create users
    console.log('Creating users...');
    const userIds: string[] = [];

    for (const userData of users) {
      const userId = await createUser(userData);
      userIds.push(userId);
      console.log(`✓ Created user: ${userData.username}`);
    }

    console.log(`\n✓ Created ${userIds.length} users\n`);

    // Create blogs for each user
    console.log('Creating blogs...');
    let totalBlogs = 0;

    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const username = users[i].username;

      console.log(`\nCreating blogs for ${username}...`);

      for (let j = 0; j < 10; j++) {
        const topic = blogTopics[j % blogTopics.length];
        await createBlog(userId, topic, totalBlogs);
        totalBlogs++;
      }

      console.log(`✓ Created 10 blogs for ${username}`);
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Users created: ${userIds.length}`);
    console.log(`   - Blogs created: ${totalBlogs}`);
    console.log(`   - Tags created: ${blogTopics.flatMap(t => t.tags).filter((v, i, a) => a.indexOf(v) === i).length}\n`);

    console.log('🔐 Login credentials for all users:');
    console.log('   Email: {username}@gmail.com');
    console.log('   Password: password123\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run seed
seed().catch(console.error);
