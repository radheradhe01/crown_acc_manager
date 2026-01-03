-- Script to update admin user credentials
-- Run this in your PostgreSQL database if the automatic update doesn't work

-- First, check if the old admin user exists
-- SELECT * FROM users WHERE email = 'admin@example.com' OR id = 'admin-user-001';

-- Update the user's email and password hash
-- Note: You'll need to generate the bcrypt hash for 'Crown4689@^^+5' first
-- You can use Node.js: require('bcryptjs').hash('Crown4689@^^+5', 10).then(console.log)

-- Example update (replace the password hash with the actual bcrypt hash):
-- UPDATE users 
-- SET email = 'crownsolution.noc@gmail.com',
--     password = '$2a$10$YOUR_BCRYPT_HASH_HERE',
--     updated_at = NOW()
-- WHERE email = 'admin@example.com' OR id = 'admin-user-001';

-- Verify the update
-- SELECT id, email, is_active FROM users WHERE email = 'crownsolution.noc@gmail.com';
