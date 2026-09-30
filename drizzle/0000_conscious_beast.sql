CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`module` text NOT NULL,
	`record_ref` text NOT NULL,
	`detail` text NOT NULL,
	`actor` text NOT NULL,
	`role` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `parties` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`gstin` text DEFAULT '' NOT NULL,
	`balance` real DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`hsn` text NOT NULL,
	`batch` text NOT NULL,
	`expiry` text NOT NULL,
	`unit` text NOT NULL,
	`stock` real DEFAULT 0 NOT NULL,
	`purchase_rate` real DEFAULT 0 NOT NULL,
	`sale_rate` real DEFAULT 0 NOT NULL,
	`gst_rate` real DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vouchers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`voucher_no` text NOT NULL,
	`type` text NOT NULL,
	`party_name` text NOT NULL,
	`item_name` text DEFAULT '' NOT NULL,
	`quantity` real DEFAULT 0 NOT NULL,
	`taxable_value` real DEFAULT 0 NOT NULL,
	`tax_amount` real DEFAULT 0 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'Credit' NOT NULL,
	`voucher_date` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vouchers_voucher_no_unique` ON `vouchers` (`voucher_no`);