import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const avaliacoesImoveis = sqliteTable('avaliacoes_imoveis', {
  id: integer('id').primaryKey(),
  imovelId: integer('imovel_id').notNull(),
  avaliadorId: integer('avaliador_id').notNull(),
  avaliacao: text('avaliacao').notNull(),
  whatsapp: text('whatsapp'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});