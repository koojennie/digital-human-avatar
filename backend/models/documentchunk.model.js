import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/supabaseClient.js';

class DocumentChunk extends Model {}

DocumentChunk.init({
  chunk_id: {
    type: DataTypes.CHAR(8),
    primaryKey: true,
    allowNull: false,
  },
  document_id: {
    type: DataTypes.CHAR(8),
    allowNull: false,
    references: { model: 'documents', key: 'document_id' },
    onDelete: 'CASCADE',
  },
  chunk_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
  embedding: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'DocumentChunk',
  tableName: 'document_chunks',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false, // ga ada updated_at di tabel inih
});

export default DocumentChunk;