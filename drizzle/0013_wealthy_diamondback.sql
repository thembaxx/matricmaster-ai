CREATE TABLE "concept_struggles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"concept" varchar(200) NOT NULL,
	"struggle_count" integer DEFAULT 1 NOT NULL,
	"last_struggle_at" timestamp DEFAULT now(),
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"subscription_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'ZAR' NOT NULL,
	"paystack_reference" varchar(100) NOT NULL,
	"paystack_transaction_id" varchar(100),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(20),
	"metadata" text,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_paystack_reference_unique" UNIQUE("paystack_reference")
);
--> statement-breakpoint
CREATE TABLE "school_admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"license_type" varchar(20) DEFAULT 'student' NOT NULL,
	"license_key" varchar(100) NOT NULL,
	"assigned_to" varchar(255),
	"assigned_at" timestamp,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "school_licenses_license_key_unique" UNIQUE("license_key")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"emis_number" varchar(20),
	"province" varchar(50),
	"district" varchar(100),
	"address" text,
	"contact_name" varchar(100),
	"contact_email" varchar(100),
	"contact_phone" varchar(20),
	"website" varchar(200),
	"total_learners" integer DEFAULT 0,
	"total_teachers" integer DEFAULT 0,
	"subscription_plan" varchar(50) DEFAULT 'free',
	"license_count" integer DEFAULT 0,
	"license_expiry" timestamp,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "schools_emis_number_unique" UNIQUE("emis_number")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price_zar" numeric(10, 2) NOT NULL,
	"billing_interval" varchar(20) DEFAULT 'monthly' NOT NULL,
	"features" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "topic_confidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"topic" varchar(200) NOT NULL,
	"subject" varchar(50) NOT NULL,
	"confidence_score" numeric(3, 2) DEFAULT '0.5' NOT NULL,
	"times_correct" integer DEFAULT 0 NOT NULL,
	"times_attempted" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"plan_id" varchar(50) NOT NULL,
	"paystack_customer_code" varchar(100),
	"paystack_subscription_code" varchar(100),
	"paystack_email_token" varchar(100),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"is_free_trial" boolean DEFAULT false NOT NULL,
	"trial_end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "study_buddy_profiles" ADD COLUMN "personality" varchar(20) DEFAULT 'mentor' NOT NULL;--> statement-breakpoint
ALTER TABLE "study_sessions" ADD COLUMN "topic" varchar(200);--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "push_subscription" text;--> statement-breakpoint
ALTER TABLE "concept_struggles" ADD CONSTRAINT "concept_struggles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_user_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."user_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_admins" ADD CONSTRAINT "school_admins_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_licenses" ADD CONSTRAINT "school_licenses_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_confidence" ADD CONSTRAINT "topic_confidence_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_subscription_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "concept_struggles_user_concept_idx" ON "concept_struggles" USING btree ("user_id","concept");--> statement-breakpoint
CREATE INDEX "concept_struggles_user_id_idx" ON "concept_struggles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_user_id_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_reference_idx" ON "payments" USING btree ("paystack_reference");--> statement-breakpoint
CREATE INDEX "school_admins_school_id_idx" ON "school_admins" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "school_admins_user_id_idx" ON "school_admins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "school_licenses_school_id_idx" ON "school_licenses" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "school_licenses_key_idx" ON "school_licenses" USING btree ("license_key");--> statement-breakpoint
CREATE INDEX "school_licenses_status_idx" ON "school_licenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "schools_name_idx" ON "schools" USING btree ("name");--> statement-breakpoint
CREATE INDEX "schools_emis_idx" ON "schools" USING btree ("emis_number");--> statement-breakpoint
CREATE INDEX "schools_status_idx" ON "schools" USING btree ("status");--> statement-breakpoint
CREATE INDEX "topic_confidence_uts_idx" ON "topic_confidence" USING btree ("user_id","topic","subject");--> statement-breakpoint
CREATE INDEX "topic_confidence_user_id_idx" ON "topic_confidence" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_subscriptions_user_id_idx" ON "user_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_subscriptions_status_idx" ON "user_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_subscriptions_plan_id_idx" ON "user_subscriptions" USING btree ("plan_id");