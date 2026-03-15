CREATE TABLE "question_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"question_id" varchar(100) NOT NULL,
	"topic" varchar(200) NOT NULL,
	"is_correct" boolean NOT NULL,
	"response_time_ms" integer,
	"next_review_at" timestamp,
	"interval_days" integer DEFAULT 1 NOT NULL,
	"ease_factor" numeric(3, 2) DEFAULT '2.5' NOT NULL,
	"attempted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "question_attempts_user_q_idx" ON "question_attempts" USING btree ("user_id","question_id");--> statement-breakpoint
CREATE INDEX "question_attempts_user_id_idx" ON "question_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "question_attempts_next_review_idx" ON "question_attempts" USING btree ("next_review_at");