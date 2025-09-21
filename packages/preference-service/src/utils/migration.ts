/**
 * Migration utilities for preference data
 */

import { MigrationHandler } from '../types';

export class MigrationManager {
  private migrations: MigrationHandler[] = [];

  addMigration(migration: MigrationHandler): void {
    this.migrations.push(migration);
    // Sort by version
    this.migrations.sort((a, b) => this.compareVersions(a.fromVersion, b.fromVersion));
  }

  async migrate(data: any, fromVersion: string, toVersion: string): Promise<any> {
    let currentData = { ...data };
    let currentVersion = fromVersion;

    // Find applicable migrations
    const applicableMigrations = this.migrations.filter(m => 
      this.compareVersions(m.fromVersion, currentVersion) >= 0 &&
      this.compareVersions(m.toVersion, toVersion) <= 0
    );

    // Apply migrations in sequence
    for (const migration of applicableMigrations) {
      if (this.compareVersions(currentVersion, migration.fromVersion) <= 0) {
        try {
          currentData = migration.migrate(currentData);
          currentVersion = migration.toVersion;
        } catch (error) {
          console.error(`Migration failed from ${migration.fromVersion} to ${migration.toVersion}:`, error);
          throw error;
        }
      }
    }

    return currentData;
  }

  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }
}

// Common migrations
export const commonMigrations: MigrationHandler[] = [
  {
    fromVersion: '0.0.0',
    toVersion: '1.0.0',
    migrate: (data: any) => {
      // Example migration: ensure required fields exist
      return {
        ...data,
        enableSignData: data.enableSignData ?? false,
        showSafeNotice: data.showSafeNotice ?? true,
        addressFlags: data.addressFlags ?? {},
      };
    }
  }
];