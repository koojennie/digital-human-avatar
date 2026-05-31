import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/supabaseClient.js';

class Document extends Model {}

Document.init({
  document_id: {
    type: DataTypes.CHAR(8),
    primaryKey: true,
    allowNull: false,
  },
  uploaded_by: {
    type: DataTypes.CHAR(8),
    allowNull: false,
    references: { model: 'users', key: 'user_id' },
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  file_url: {
    type: DataTypes.STRING(256),
    allowNull: true,
  },
  mime_type: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  file_size: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  category: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'general',
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'processing',
  },
  chunk_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  sequelize,
  modelName: 'Document',
  tableName: 'documents',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Document;