import { User, UserRole } from 'src/user/entities';
import { AppDataSource } from './data-source';

async function createAdmin() {
  // Initialize TypeORM connection
  await AppDataSource.initialize();

  try {
    // Create data using TypeORM entities (not for storage)
    const admin = new User();
    admin.email = 'admin@kwanso.com';
    admin.name = 'admin';
    admin.role = UserRole.admin;
    admin.password = '12345678';

    // Save data to the database
    await AppDataSource.manager.save(admin);

    console.log('Data seeded successfully');
  } finally {
    await AppDataSource.destroy();
  }
}

createAdmin().catch(console.error);
