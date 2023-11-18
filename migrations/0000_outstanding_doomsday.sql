CREATE TABLE `page` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`external_id` text NOT NULL,
	`last_updated_at` text NOT NULL,
	`time_zone` text NOT NULL,
	`status_indicator` text NOT NULL,
	`status_description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

