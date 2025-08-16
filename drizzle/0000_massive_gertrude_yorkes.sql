CREATE TABLE `avaliacoes_imoveis` (
	`id` integer PRIMARY KEY NOT NULL,
	`imovel_id` integer NOT NULL,
	`avaliador_id` integer NOT NULL,
	`avaliacao` text NOT NULL,
	`whatsapp` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
