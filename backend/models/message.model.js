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
    references: { model: 'conversations', key: 'id' },
    onDelete: 'CASCADE',
  },
  parent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'Refers to the message this is replying to, useful for branching/threads',
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
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'error'),
    defaultValue: 'sent',
  },
  audio_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emotion: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'The detected or intended emotion of the message',
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'The LLM model used (e.g., gpt-4, claude-3)',
  },
  finish_reason: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reason why the LLM stopped generating (stop, length, etc)',
  },
  token_usage: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  latency_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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