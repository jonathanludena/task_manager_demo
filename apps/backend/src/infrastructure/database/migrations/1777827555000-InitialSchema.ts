import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777827555000 implements MigrationInterface {
    name = 'InitialSchema1777827555000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" text NOT NULL,
                "description" text NOT NULL DEFAULT '',
                "completed" boolean NOT NULL DEFAULT false,
                "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tasks"`);
    }
}
