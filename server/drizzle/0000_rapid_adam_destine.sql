CREATE TABLE `urls` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`short_code` varchar(10) NOT NULL,
	`long_url` varchar(2048) NOT NULL,
	`clicks` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `urls_id` PRIMARY KEY(`id`),
	CONSTRAINT `urls_short_code_unique` UNIQUE(`short_code`)
);
