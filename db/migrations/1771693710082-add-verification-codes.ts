import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerificationCodes1771693710082 implements MigrationInterface {
    name = 'AddVerificationCodes1771693710082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_codes_type_enum') THEN
                    CREATE TYPE "public"."verification_codes_type_enum" AS ENUM('email_verification', 'password_reset');
                END IF;
            END$$;
        `);
        await queryRunner.query(`CREATE TABLE "verification_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid, "user_id" uuid NOT NULL, "code" character varying(10) NOT NULL, "type" "public"."verification_codes_type_enum" NOT NULL DEFAULT 'email_verification', "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_used" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_verification_codes" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_verification_codes_user_id_type" ON "verification_codes" ("user_id", "type") `);
        await queryRunner.query(`ALTER TABLE "department_oee_settings" ALTER COLUMN "oee_goal" SET DEFAULT '72.67'`);
        await queryRunner.query(`ALTER TABLE "verification_codes" ADD CONSTRAINT "FK_verification_codes_users_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "verification_codes" DROP CONSTRAINT "FK_verification_codes_users_user_id"`);
        await queryRunner.query(`ALTER TABLE "department_oee_settings" ALTER COLUMN "oee_goal" SET DEFAULT 72.67`);
        await queryRunner.query(`DROP INDEX "public"."IDX_verification_codes_user_id_type"`);
        await queryRunner.query(`DROP TABLE "verification_codes"`);
        await queryRunner.query(`DROP TYPE "public"."verification_codes_type_enum"`);
    }

}
