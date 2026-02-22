import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationShifts1771797199205 implements MigrationInterface {
    name = 'AddLocationShifts1771797199205'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" RENAME COLUMN "email" TO "shifts"`);
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "shifts"`);
        await queryRunner.query(`ALTER TABLE "locations" ADD "shifts" jsonb`);
        await queryRunner.query(`ALTER TABLE "department_oee_settings" ALTER COLUMN "oee_goal" SET DEFAULT '72.67'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "department_oee_settings" ALTER COLUMN "oee_goal" SET DEFAULT 72.67`);
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "shifts"`);
        await queryRunner.query(`ALTER TABLE "locations" ADD "shifts" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "locations" RENAME COLUMN "shifts" TO "email"`);
    }

}
