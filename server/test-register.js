require('dotenv').config();
const { User } = require('./models');

async function testRegister() {
  try {
    console.log('Testing user registration...');
    
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      role: 'student'
    };

    console.log('Creating user with data:', testUser);
    
    const user = await User.create(testUser);
    
    console.log('Success! Created user:', {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    });
    
    // Clean up
    await user.destroy();
    console.log('Test user deleted successfully');
    
  } catch (error) {
    console.error('Error during registration test:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  }
  
  process.exit(0);
}

testRegister();
