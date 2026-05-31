import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/supabaseClient.js';

class Message extends Model {}

Message.init({
  message_id: {
    type: DataTypes.CHAR(8),
    primaryKey: true,
    allowNull: false,
  },
  conversation_id: {
    type: DataTypes.CHAR(8),
    allowNull: false,
    references: { model: 'conversations', key: 'conversation_id' },
    onDelete: 'CASCADE',
  },
  parent_id: {
    type: DataTypes.CHAR(8),
    allowNull: true,
    references: { model: 'messages', key: 'message_id' },
    comment: 'Refers to the message this is replying to, useful for branching/threads',
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant', 'system', 'tool'),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('text', 'voice', 'system', 'image', 'message'),
    allowNull: false,
    defaultValue: 'text',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'error'),
    allowNull: false,
    defaultValue: 'pending',
  },
  audio_url: {
    type: DataTypes.STRING(256),
    allowNull: true,
  },
  emotion: {
    type: DataTypes.STRING(80),
    allowNull: true,
    comment: 'The detected or intended emotion of the message',
  },
  model: {
    type: DataTypes.STRING(80),
    allowNull: true,
    comment: 'The LLM model used (e.g., gpt-4, claude-3)',
  },
  finish_reason: {
    type: DataTypes.STRING(80),
    allowNull: true,
    comment: 'Reason why the LLM stopped generating (stop, length, etc)',
  },
  token_usage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  latency_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  is_edited: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
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