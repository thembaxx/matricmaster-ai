ALTER TABLE `subjects` ADD `slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `subjects` ADD `display_name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `subjects` ADD `emoji` text;--> statement-breakpoint
ALTER TABLE `subjects` ADD `fluent_emoji` text;--> statement-breakpoint
ALTER TABLE `subjects` ADD `img_src` text;--> statement-breakpoint
ALTER TABLE `subjects` ADD `color` text;--> statement-breakpoint
ALTER TABLE `subjects` ADD `bg_color` text;--> statement-breakpoint
ALTER TABLE `subjects` ADD `icon` text;--> statement-breakpoint
ALTER TABLE `subjects` ADD `font_family` text;--> statement-breakpoint
ALTER TABLE `subjects` ADD `gradient_primary` text;--> statement-breakpoint
ALTER TABLE `subjects` ADD `gradient_secondary` text;--> statement-breakpoint
ALTER TABLE `subjects` ADD `gradient_accent` text;--> statement-breakpoint
ALTER TABLE `subjects` ADD `is_supported` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `subjects` ADD `display_order` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_slug_unique` ON `subjects` (`slug`);