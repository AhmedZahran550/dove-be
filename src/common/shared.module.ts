import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { GCStorageService } from './gc-storage.service';
import { CacheService } from './cache.service';
import { FirestoreService } from './firebase/firestore.service';

@Global()
@Module({
  providers: [StorageService, GCStorageService, CacheService, FirestoreService],
  exports: [StorageService, GCStorageService, CacheService, FirestoreService],
})
export class SharedModule {}
