// Test script for Posts API functionality
const mongoose = require('mongoose');
require('dotenv').config();

async function testPostsAPI() {
  try {
    console.log('Testing Posts API functionality...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');
    
    const { Post } = require('./src/models/postModel');
    const { User } = require('./src/models/user');
    
    // Test 1: Find a test user (alumni or student)
    console.log('\n1. Finding test users...');
    const testAlumni = await User.findOne({ role: 'alumni' });
    const testStudent = await User.findOne({ role: 'student' });
    
    if (!testAlumni && !testStudent) {
      console.log('❌ No alumni or student users found. Please create some test users first.');
      return;
    }
    
    const testUser = testAlumni || testStudent;
    console.log(`✅ Found test user: ${testUser.firstName} ${testUser.lastName} (${testUser.role})`);
    
    // Test 2: Create a sample post
    console.log('\n2. Creating sample post...');
    const samplePost = {
      title: 'Welcome to Department Posts!',
      content: 'This is a test post to verify our LinkedIn-style sharing feature is working. Alumni and students can now share thoughts, achievements, and experiences within their department!',
      author: testUser._id,
      department: testUser.department,
      postType: 'general',
      tags: ['test', 'welcome', 'department'],
      visibility: 'department'
    };
    
    // Check if post already exists
    const existingPost = await Post.findOne({ title: samplePost.title });
    if (!existingPost) {
      const newPost = await Post.create(samplePost);
      console.log(`✅ Created post: "${newPost.title}"`);
    } else {
      console.log(`- Post already exists: "${existingPost.title}"`);
    }
    
    // Test 3: Query posts by department
    console.log('\n3. Testing department-based post filtering...');
    const departmentPosts = await Post.find({ 
      department: testUser.department,
      isActive: true 
    })
    .populate('author', 'firstName lastName role department')
    .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${departmentPosts.length} posts for ${testUser.department} department`);
    departmentPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" by ${post.author?.firstName} ${post.author?.lastName}`);
    });
    
    // Test 4: Test like functionality
    console.log('\n4. Testing like functionality...');
    if (departmentPosts.length > 0) {
      const testPost = departmentPosts[0];
      const originalLikeCount = testPost.likes.length;
      
      // Add a like
      testPost.likes.push({ user: testUser._id });
      await testPost.save();
      
      console.log(`✅ Added like to post "${testPost.title}"`);
      console.log(`   Like count: ${originalLikeCount} → ${testPost.likes.length}`);
    }
    
    // Test 5: Test comment functionality
    console.log('\n5. Testing comment functionality...');
    if (departmentPosts.length > 0) {
      const testPost = departmentPosts[0];
      const originalCommentCount = testPost.comments.length;
      
      // Add a comment
      testPost.comments.push({
        user: testUser._id,
        content: 'This is a test comment to verify the commenting system works!'
      });
      await testPost.save();
      
      console.log(`✅ Added comment to post "${testPost.title}"`);
      console.log(`   Comment count: ${originalCommentCount} → ${testPost.comments.length}`);
    }
    
    console.log('\n✅ All Posts API tests completed successfully!');
    console.log('\n🚀 Ready to test in the frontend:');
    console.log('   1. Login as alumni or student user');
    console.log('   2. Navigate to /posts');
    console.log('   3. Create, like, and comment on posts');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase disconnected');
  }
}

testPostsAPI();