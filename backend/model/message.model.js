import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/supabaseClient.js'; // Corrected import path

class Message extends Model {}

Message.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'conversations', key: 'id' }
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant', 'system', 'tool'),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('text', 'voice', 'system', 'image', 'message'),
    defaultValue: 'text',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  audio_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emotion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token_usage: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  latency_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  sequelize,
  modelName: 'Message',
  tableName: 'messages',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Message;