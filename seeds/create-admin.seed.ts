import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User, UserRole } from 'src/user/entities';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource) {
    // Check if the admin already exists
    const adminExists = await dataSource.manager.findOneBy(User, {
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
    await dataSource.manager.save(admin);

    console.log('Admin created successfully');
  }
}
