import { User, UserRole } from 'src/user/entities';
import { AppDataSource } from './data-source';

async function createAdmin() {
  // Initialize TypeORM connection
  await AppDataSource.initialize();

  try {
    // Check if the admin already exists
    const adminExists = await AppDataSource.manager.findOneBy(User, {
      role: UserRole.admin,
    });
    if (!!adminExists) {
      console.log('Admin already exists');
      return;
    }

    // Create data using TypeORM entities
    const admin = new User();
    admin.email = 'admin@kwanso.com';
    admin.name = 'admin';
    admin.role = UserRole.admin;
    admin.password = '12345678';

    // Save data to the database
    await AppDataSource.manager.save(admin);

    console.log('Admin created successfully');
  } finally {
    await AppDataSource.destroy();
  }
}

createAdmin().catch(console.error);
