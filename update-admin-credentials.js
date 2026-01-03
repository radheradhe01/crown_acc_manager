// Script to manually update admin user credentials
// Run this with: node update-admin-credentials.js

const bcrypt = require('bcryptjs');
const { db } = require('./server/db');
const { users } = require('./shared/schema');
const { eq, or } = require('drizzle-orm');

async function updateAdminUser() {
  try {
    console.log('Updating admin user credentials...');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash('Crown4689@^^+5', 10);
    console.log('Password hashed successfully');
    
    // Find the admin user (by old email or ID)
    const [oldUser] = await db
      .select()
      .from(users)
      .where(or(
        eq(users.email, 'admin@example.com'),
        eq(users.id, 'admin-user-001')
      ))
      .limit(1);
    
    if (!oldUser) {
      // Check if new user already exists
      const [newUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, 'crownsolution.noc@gmail.com'))
        .limit(1);
      
      if (newUser) {
        console.log('Admin user with new email already exists:', newUser.email);
        return;
      }
      
      // Create new user if none exists
      const [newAdmin] = await db
        .insert(users)
        .values({
          id: 'admin-user-001',
          email: 'crownsolution.noc@gmail.com',
          firstName: 'John',
          lastName: 'Smith',
          password: hashedPassword,
          isActive: true,
          profileImageUrl: null,
        })
        .returning();
      
      console.log('New admin user created:', newAdmin.email);
      return;
    }
    
    // Update existing user
    const [updatedUser] = await db
      .update(users)
      .set({
        email: 'crownsolution.noc@gmail.com',
        password: hashedPassword,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, oldUser.id))
      .returning();
    
    console.log('Admin user updated successfully!');
    console.log('New email:', updatedUser.email);
    console.log('User ID:', updatedUser.id);
    
  } catch (error) {
    console.error('Error updating admin user:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

updateAdminUser();
