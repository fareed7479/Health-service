import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.model.js';

dotenv.config();

/**
 * Database Migration Script
 * 
 * Purpose: Fix existing providers to have isVerified = false so they appear in pending list
 * 
 * Before: Providers created with default isVerified = true (auto-approved)
 * After: Providers updated to isVerified = false (pending admin approval)
 * 
 * Run: npm run fix-providers
 */

const migrateProviders = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Find all providers
    const allProviders = await User.find({ role: 'provider' });
    console.log(`📊 Found ${allProviders.length} providers in database\n`);

    if (allProviders.length === 0) {
      console.log('✅ No providers to migrate');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Separate providers by verification status
    const verifiedProviders = allProviders.filter(p => p.isVerified === true);
    const pendingProviders = allProviders.filter(p => p.isVerified === false);

    console.log(`📋 Provider Status:`)
    console.log(`   ✅ Already verified (approved): ${verifiedProviders.length}`)
    console.log(`   ⏳ Already pending (not verified): ${pendingProviders.length}\n`)

    if (verifiedProviders.length === 0) {
      console.log('✅ All providers are already in pending status');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Ask user to confirm migration (in non-interactive mode, automatically proceed)
    console.log('⚠️  WARNING: This will update provider verification status:');
    console.log(`   - Set ${verifiedProviders.length} providers to isVerified = false\n`);

    console.log('💡 Note: The 4 admins will NOT be affected (only providers)\n');

    // Update verified providers to pending
    const updateResult = await User.updateMany(
      { 
        role: 'provider',
        isVerified: true
      },
      { 
        $set: { isVerified: false }
      }
    );

    console.log('✅ Migration completed!\n');
    console.log('📊 Results:');
    console.log(`   ✏️  Modified: ${updateResult.modifiedCount} provider(s)`)
    console.log(`   ℹ️  Matched: ${updateResult.matchedCount} provider(s)\n`);

    // Show new status
    const newVerifiedProviders = await User.countDocuments({ 
      role: 'provider', 
      isVerified: true 
    });
    const newPendingProviders = await User.countDocuments({ 
      role: 'provider', 
      isVerified: false 
    });

    console.log('📋 New Provider Status:');
    console.log(`   ✅ Approved (verified): ${newVerifiedProviders}`)
    console.log(`   ⏳ Pending (not verified): ${newPendingProviders}\n`);

    console.log('🎯 Action Items:');
    console.log('   1. All providers now appear as PENDING in Admin → Provider Approval');
    console.log('   2. Admin must approve each provider individually');
    console.log('   3. Providers cannot login until approved');
    console.log('   4. Upon approval, providers can login and access dashboard\n');

    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    console.log('✨ Migration completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration error:');
    console.error(error.message);

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

// Run the migration
migrateProviders();
